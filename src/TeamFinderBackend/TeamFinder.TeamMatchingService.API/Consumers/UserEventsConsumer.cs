using RabbitMQ.Client.Events;
using RabbitMQ.Client;
using System.Text.Json;
using TeamFinder.TeamMatchingService.API.Data;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TeamFinder.TeamMatchingService.API.Models;

namespace TeamFinder.TeamMatchingService.API.Consumers
{
    public class UserEventsConsumer : BackgroundService
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly string _exchangeName = "user_events";
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<UserEventsConsumer> _logger;

        public UserEventsConsumer(IServiceProvider serviceProvider, IConfiguration configuration, ILogger<UserEventsConsumer> logger)
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
                var queueName = "team_service_user_events";
                _channel.QueueDeclare(
                    queue: queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false);

                // Bind the queue to the exchange with routing keys
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "user.registered");
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "user.updated");
                _channel.QueueBind(queue: queueName, exchange: _exchangeName, routingKey: "user.deleted");

                _logger.LogInformation("Connected to RabbitMQ and configured queues/bindings");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to RabbitMQ");
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

                    _logger.LogInformation($"Received message with routing key: {routingKey}");

                    await ProcessMessageAsync(routingKey, message);

                    // Acknowledge the message
                    _channel.BasicAck(eventArgs.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message");
                    // Negative acknowledgment, requeue the message
                    _channel.BasicNack(eventArgs.DeliveryTag, false, true);
                }
            };

            // Start consuming from the queue
            _channel.BasicConsume(queue: "team_service_user_events", autoAck: false, consumer: consumer);

            return Task.CompletedTask;
        }

        private async Task ProcessMessageAsync(string routingKey, string message)
        {
            _logger.LogInformation($"Processing message: {routingKey}");

            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<TeamDbContext>();

            switch (routingKey)
            {
                case "user.registered":
                    await HandleUserRegisteredAsync(message, dbContext);
                    break;
                case "user.updated":
                    await HandleUserUpdatedAsync(message, dbContext);
                    break;
                case "user.deleted":
                    await HandleUserDeletedAsync(message, dbContext);
                    break;
                default:
                    _logger.LogWarning($"Unknown routing key: {routingKey}");
                    break;
            }
        }

        private async Task HandleUserRegisteredAsync(string message, TeamDbContext dbContext)
        {
            try
            {
                var userRegistered = JsonSerializer.Deserialize<UserRegisteredEvent>(message);
                if (userRegistered == null)
                {
                    _logger.LogWarning("Failed to deserialize user.registered event");
                    return;
                }

                // Check if user already exists
                var existingUser = await dbContext.Users.FindAsync(userRegistered.UserId);
                if (existingUser != null)
                {
                    _logger.LogWarning($"User {userRegistered.UserId} already exists in the team service database");
                    return;
                }

                // Create a new user in the team service database
                var user = new User
                {
                    Id = userRegistered.UserId,
                    Username = userRegistered.Username,
                    Email = userRegistered.Email
                    // Other properties will be null/default for now
                };

                dbContext.Users.Add(user);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation($"Added user {userRegistered.UserId} to team service database");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling user.registered event");
            }
        }

        private async Task HandleUserUpdatedAsync(string message, TeamDbContext dbContext)
        {
            try
            {
                var userUpdated = JsonSerializer.Deserialize<UserUpdatedEvent>(message);
                if (userUpdated == null)
                {
                    _logger.LogWarning("Failed to deserialize user.updated event");
                    return;
                }

                // Find the user
                var user = await dbContext.Users.FindAsync(userUpdated.UserId);
                if (user == null)
                {
                    _logger.LogWarning($"User {userUpdated.UserId} not found in team service database");
                    return;
                }

                // Update the user properties
                user.Username = userUpdated.Username;
                user.Email = userUpdated.Email;

                // Update team member username in all teams
                var teamMembers = await dbContext.TeamMembers
                    .Where(tm => tm.UserId == userUpdated.UserId)
                    .ToListAsync();

                foreach (var teamMember in teamMembers)
                {
                    teamMember.Username = userUpdated.Username;
                }

                await dbContext.SaveChangesAsync();
                _logger.LogInformation($"Updated user {userUpdated.UserId} in team service database");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling user.updated event");
            }
        }

        private async Task HandleUserDeletedAsync(string message, TeamDbContext dbContext)
        {
            try
            {
                var userDeleted = JsonSerializer.Deserialize<UserDeletedEvent>(message);
                if (userDeleted == null)
                {
                    _logger.LogWarning("Failed to deserialize user.deleted event");
                    return;
                }

                // Find the user
                var user = await dbContext.Users.FindAsync(userDeleted.UserId);
                if (user == null)
                {
                    _logger.LogWarning($"User {userDeleted.UserId} not found in team service database");
                    return;
                }

                // Find all teams owned by the user
                var ownedTeams = await dbContext.Teams
                    .Where(t => t.OwnerId == userDeleted.UserId)
                    .ToListAsync();

                // Delete owned teams and their members
                foreach (var team in ownedTeams)
                {
                    var teamMembers = await dbContext.TeamMembers
                        .Where(tm => tm.TeamId == team.Id)
                        .ToListAsync();

                    dbContext.TeamMembers.RemoveRange(teamMembers);
                    dbContext.Teams.Remove(team);
                }

                // Remove user from all teams where they are a member
                var teamMemberships = await dbContext.TeamMembers
                    .Where(tm => tm.UserId == userDeleted.UserId)
                    .ToListAsync();

                dbContext.TeamMembers.RemoveRange(teamMemberships);

                // Delete the user
                dbContext.Users.Remove(user);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation($"Deleted user {userDeleted.UserId} from team service database");
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

    // Event classes for deserialization
    public class UserRegisteredEvent
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class UserUpdatedEvent
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class UserDeletedEvent
    {
        public Guid UserId { get; set; }
    }
}
