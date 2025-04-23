namespace TeamFinder.UserService.API.Services
{
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

    public interface IMessagePublisher
    {
        Task PublishUserRegisteredAsync(UserRegisteredEvent userRegistered);
        Task PublishUserUpdatedAsync(UserUpdatedEvent userUpdated);
        Task PublishUserDeletedAsync(UserDeletedEvent userDeleted);
    }
}
