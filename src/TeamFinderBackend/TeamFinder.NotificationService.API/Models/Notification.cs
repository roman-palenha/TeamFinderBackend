namespace TeamFinder.NotificationService.API.Models
{
    public class Notification
    {
        public string Type { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public object? Data { get; set; }
    }

    // Event classes for RabbitMQ consumers
    // User Events
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

    // Team Events
    public class TeamCreatedEvent
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
    }

    public class TeamJoinedEvent
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    public class TeamLeftEvent
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    public class TeamDeletedEvent
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
    }
}
