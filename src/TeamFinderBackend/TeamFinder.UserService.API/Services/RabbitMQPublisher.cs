using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace TeamFinder.UserService.API.Services
{
    public class RabbitMQPublisher : IMessagePublisher, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly string _exchangeName = "user_events";

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

        public Task PublishUserRegisteredAsync(UserRegisteredEvent userRegistered)
        {
            return PublishMessageAsync(userRegistered, "user.registered");
        }

        public Task PublishUserUpdatedAsync(UserUpdatedEvent userUpdated)
        {
            return PublishMessageAsync(userUpdated, "user.updated");
        }

        public Task PublishUserDeletedAsync(UserDeletedEvent userDeleted)
        {
            return PublishMessageAsync(userDeleted, "user.deleted");
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
