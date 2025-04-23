
using System.Text.Json;
using System.Text;
using RabbitMQ.Client;

namespace TeamFinder.TeamMatchingService.API.Services
{
    public class RabbitMQPublisher : IMessagePublisher, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly string _exchangeName = "team_events";

        public RabbitMQPublisher(IConfiguration configuration)
        {
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
            }
            catch (Exception ex)
            {
                // Log the error but allow the service to start without RabbitMQ
                Console.WriteLine($"Failed to connect to RabbitMQ: {ex.Message}");
                // In production, you might want to use a logger or implement retry logic
            }
        }

        public Task PublishTeamCreatedAsync(TeamCreatedEvent teamCreated)
        {
            return PublishMessageAsync(teamCreated, "team.created");
        }

        public Task PublishTeamJoinedAsync(TeamJoinedEvent teamJoined)
        {
            return PublishMessageAsync(teamJoined, "team.joined");
        }

        public Task PublishTeamLeftAsync(TeamLeftEvent teamLeft)
        {
            return PublishMessageAsync(teamLeft, "team.left");
        }

        public Task PublishTeamDeletedAsync(TeamDeletedEvent teamDeleted)
        {
            return PublishMessageAsync(teamDeleted, "team.deleted");
        }

        private Task PublishMessageAsync<T>(T message, string routingKey)
        {
            if (_channel == null || !_connection.IsOpen)
            {
                // Log the error but don't throw an exception to allow the service to continue working
                Console.WriteLine("RabbitMQ connection not available. Message not published.");
                return Task.CompletedTask;
            }

            try
            {
                var messageJson = JsonSerializer.Serialize(message);
                var body = Encoding.UTF8.GetBytes(messageJson);

                var properties = _channel.CreateBasicProperties();
                properties.Persistent = true;
                properties.ContentType = "application/json";

                _channel.BasicPublish(
                    exchange: _exchangeName,
                    routingKey: routingKey,
                    basicProperties: properties,
                    body: body);

                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Failed to publish message: {ex.Message}");
                return Task.CompletedTask;
            }
        }

        public void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
        }
    }
}
