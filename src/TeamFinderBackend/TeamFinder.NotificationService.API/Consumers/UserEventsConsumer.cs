using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using TeamFinder.NotificationService.API.Models;
using TeamFinder.NotificationService.API.Services;

namespace TeamFinder.NotificationService.API.Consumers
{
    public class UserEventsConsumer : BackgroundService
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly string _exchangeName = "user_events";
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<UserEventsConsumer> _logger;

        public UserEventsConsumer(IServiceProvider serviceProvider, IConfiguration configuration,
            ILogger<UserEventsConsumer> logger)
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

                // Declare the exchange
                _channel.ExchangeDeclare(
                    exchange: _exchangeName,
                    type: ExchangeType.Topic,
                    durable: true,
                    autoDelete: false);

                // Declare the queue
                var queueName = "notification_service_user_events";
                _channel.QueueDeclare(
                    queue: queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false);

                // Bind the queue to the exchange with routing keys
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "user.registered");
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "user.updated");
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "user.deleted");

                _logger.LogInformation("Connected to RabbitMQ and configured user events queue");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to RabbitMQ for user events");
            }
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_channel == null)
            {
                _logger.LogWarning("RabbitMQ channel not available. User events consumer not started.");
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

                    _logger.LogInformation($"Received user event message with routing key: {routingKey}");

                    await ProcessMessageAsync(routingKey, message);

                    // Acknowledge the message
                    _channel.BasicAck(eventArgs.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing user event message");
                    // Negative acknowledgment, requeue the message
                    _channel.BasicNack(eventArgs.DeliveryTag, false, true);
                }
            };

            // Start consuming from the queue
            _channel.BasicConsume(queue: "notification_service_user_events", autoAck: false, consumer: consumer);

            return Task.CompletedTask;
        }

        private async Task ProcessMessageAsync(string routingKey, string message)
        {
            using var scope = _serviceProvider.CreateScope();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            switch (routingKey)
            {
                case "user.registered":
                    await HandleUserRegisteredAsync(message, notificationService);
                    break;
                case "user.updated":
                    await HandleUserUpdatedAsync(message, notificationService);
                    break;
                case "user.deleted":
                    await HandleUserDeletedAsync(message, notificationService);
                    break;
                default:
                    _logger.LogWarning($"Unknown user event routing key: {routingKey}");
                    break;
            }
        }

        private async Task HandleUserRegisteredAsync(string message, INotificationService notificationService)
        {
            try
            {
                var userRegistered = JsonSerializer.Deserialize<UserRegisteredEvent>(message);
                if (userRegistered == null)
                {
                    _logger.LogWarning("Failed to deserialize user.registered event");
                    return;
                }

                // Create notification
                var notification = new Notification
                {
                    Type = "UserRegistered",
                    Message = $"Welcome, {userRegistered.Username}! Your account has been created successfully.",
                    Timestamp = DateTime.UtcNow,
                    Data = new { userRegistered.UserId, userRegistered.Username }
                };

                // Send notification to the specific user
                await notificationService.SendToUserAsync(userRegistered.UserId, notification);

                _logger.LogInformation($"Sent UserRegistered notification to user {userRegistered.UserId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling user.registered event");
            }
        }

        private async Task HandleUserUpdatedAsync(string message, INotificationService notificationService)
        {
            try
            {
                var userUpdated = JsonSerializer.Deserialize<UserUpdatedEvent>(message);
                if (userUpdated == null)
                {
                    _logger.LogWarning("Failed to deserialize user.updated event");
                    return;
                }

                // Create notification
                var notification = new Notification
                {
                    Type = "UserUpdated",
                    Message = $"Your profile has been updated successfully.",
                    Timestamp = DateTime.UtcNow,
                    Data = new { userUpdated.UserId, userUpdated.Username }
                };

                // Send notification to the specific user
                await notificationService.SendToUserAsync(userUpdated.UserId, notification);

                _logger.LogInformation($"Sent UserUpdated notification to user {userUpdated.UserId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling user.updated event");
            }
        }

        private async Task HandleUserDeletedAsync(string message, INotificationService notificationService)
        {
            try
            {
                var userDeleted = JsonSerializer.Deserialize<UserDeletedEvent>(message);
                if (userDeleted == null)
                {
                    _logger.LogWarning("Failed to deserialize user.deleted event");
                    return;
                }

                // No need to send notification to the user since their account is deleted
                _logger.LogInformation($"Received UserDeleted event for user {userDeleted.UserId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling user.deleted event");
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
