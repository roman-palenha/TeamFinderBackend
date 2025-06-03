using Microsoft.AspNetCore.Connections;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using TeamFinder.NotificationService.API.Models;
using TeamFinder.NotificationService.API.Services;

namespace TeamFinder.NotificationService.API.Consumers
{
    public class TeamEventsConsumer : BackgroundService
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly string _exchangeName = "team_events";
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TeamEventsConsumer> _logger;

        public TeamEventsConsumer(IServiceProvider serviceProvider, IConfiguration configuration,
            ILogger<TeamEventsConsumer> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;

            var factory = new ConnectionFactory()
            {
                HostName = configuration["RabbitMQ:Host"] ?? "localhost",
                UserName = configuration["RabbitMQ:Username"] ?? "guest",
                Password = configuration["RabbitMQ:Password"] ?? "guest",
                Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672")
            };

            try
            {
                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                _channel.ExchangeDeclare(
                    exchange: _exchangeName,
                    type: ExchangeType.Topic,
                    durable: true,
                    autoDelete: false);

                var queueName = "notification_service_team_events";
                _channel.QueueDeclare(
                    queue: queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false);

                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "team.created");
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "team.joined");
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "team.left");
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "team.deleted");

                _logger.LogInformation("Connected to RabbitMQ and configured team events queue");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to RabbitMQ for team events");
            }
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_channel == null)
            {
                _logger.LogWarning("RabbitMQ channel not available. Team events consumer not started.");
                return Task.CompletedTask;
            }

            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += async (sender, eventArgs) =>
            {
                try
                {
                    var body = eventArgs.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);
                    var routingKey = eventArgs.RoutingKey;

                    _logger.LogInformation($"Received team event message with routing key: {routingKey}");

                    await ProcessMessageAsync(routingKey, message);

                    _channel.BasicAck(eventArgs.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing team event message");
                    _channel.BasicNack(eventArgs.DeliveryTag, false, true);
                }
            };

            _channel.BasicConsume(queue: "notification_service_team_events", autoAck: false, consumer: consumer);

            return Task.CompletedTask;
        }

        private async Task ProcessMessageAsync(string routingKey, string message)
        {
            using var scope = _serviceProvider.CreateScope();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            switch (routingKey)
            {
                case "team.created":
                    await HandleTeamCreatedAsync(message, notificationService);
                    break;
                case "team.joined":
                    await HandleTeamJoinedAsync(message, notificationService);
                    break;
                case "team.left":
                    await HandleTeamLeftAsync(message, notificationService);
                    break;
                case "team.deleted":
                    await HandleTeamDeletedAsync(message, notificationService);
                    break;
                default:
                    _logger.LogWarning($"Unknown team event routing key: {routingKey}");
                    break;
            }
        }

        private async Task HandleTeamCreatedAsync(string message, INotificationService notificationService)
        {
            try
            {
                var teamCreated = JsonSerializer.Deserialize<TeamCreatedEvent>(message);
                if (teamCreated == null)
                {
                    _logger.LogWarning("Failed to deserialize team.created event");
                    return;
                }

                var ownerNotification = new Notification
                {
                    Type = "TeamCreated",
                    Message = $"Your team '{teamCreated.TeamName}' has been created successfully!",
                    Timestamp = DateTime.UtcNow,
                    Data = new { teamCreated.TeamId, teamCreated.TeamName, teamCreated.OwnerId }
                };

                await notificationService.SendToUserAsync(teamCreated.OwnerId, ownerNotification);

                _logger.LogInformation($"Sent TeamCreated notification to user {teamCreated.OwnerId} for team {teamCreated.TeamId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling team.created event");
            }
        }

        private async Task HandleTeamJoinedAsync(string message, INotificationService notificationService)
        {
            try
            {
                var teamJoined = JsonSerializer.Deserialize<TeamJoinedEvent>(message);
                if (teamJoined == null)
                {
                    _logger.LogWarning("Failed to deserialize team.joined event");
                    return;
                }

                var userNotification = new Notification
                {
                    Type = "TeamJoined",
                    Message = $"You have successfully joined the team '{teamJoined.TeamName}'!",
                    Timestamp = DateTime.UtcNow,
                    Data = new { teamJoined.TeamId, teamJoined.TeamName, teamJoined.UserId, teamJoined.Username }
                };

                await notificationService.SendToUserAsync(teamJoined.UserId, userNotification);

                var teamNotification = new Notification
                {
                    Type = "TeamMemberJoined",
                    Message = $"{teamJoined.Username} has joined the team!",
                    Timestamp = DateTime.UtcNow,
                    Data = new { teamJoined.TeamId, teamJoined.TeamName, teamJoined.UserId, teamJoined.Username }
                };

                await notificationService.SendToTeamAsync(teamJoined.TeamId, teamNotification);

                _logger.LogInformation($"Sent TeamJoined notifications for user {teamJoined.UserId} in team {teamJoined.TeamId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling team.joined event");
            }
        }

        private async Task HandleTeamLeftAsync(string message, INotificationService notificationService)
        {
            try
            {
                var teamLeft = JsonSerializer.Deserialize<TeamLeftEvent>(message);
                if (teamLeft == null)
                {
                    _logger.LogWarning("Failed to deserialize team.left event");
                    return;
                }

                var userNotification = new Notification
                {
                    Type = "TeamLeft",
                    Message = $"You have left the team '{teamLeft.TeamName}'.",
                    Timestamp = DateTime.UtcNow,
                    Data = new { teamLeft.TeamId, teamLeft.TeamName, teamLeft.UserId, teamLeft.Username }
                };

                await notificationService.SendToUserAsync(teamLeft.UserId, userNotification);

                var teamNotification = new Notification
                {
                    Type = "TeamMemberLeft",
                    Message = $"{teamLeft.Username} has left the team.",
                    Timestamp = DateTime.UtcNow,
                    Data = new { teamLeft.TeamId, teamLeft.TeamName, teamLeft.UserId, teamLeft.Username }
                };

                await notificationService.SendToTeamAsync(teamLeft.TeamId, teamNotification);

                _logger.LogInformation($"Sent TeamLeft notifications for user {teamLeft.UserId} in team {teamLeft.TeamId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling team.left event");
            }
        }

        private async Task HandleTeamDeletedAsync(string message, INotificationService notificationService)
        {
            try
            {
                var teamDeleted = JsonSerializer.Deserialize<TeamDeletedEvent>(message);
                if (teamDeleted == null)
                {
                    _logger.LogWarning("Failed to deserialize team.deleted event");
                    return;
                }

                var teamNotification = new Notification
                {
                    Type = "TeamDeleted",
                    Message = $"Team '{teamDeleted.TeamName}' has been deleted.",
                    Timestamp = DateTime.UtcNow,
                    Data = new { teamDeleted.TeamId, teamDeleted.TeamName }
                };

                await notificationService.SendToTeamAsync(teamDeleted.TeamId, teamNotification);

                _logger.LogInformation($"Sent TeamDeleted notification for team {teamDeleted.TeamId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling team.deleted event");
            }
        }

        public override void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            base.Dispose();
        }
    }
}
