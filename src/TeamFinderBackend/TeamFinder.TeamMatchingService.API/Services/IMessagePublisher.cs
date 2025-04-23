namespace TeamFinder.TeamMatchingService.API.Services
{
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

    public interface IMessagePublisher
    {
        Task PublishTeamCreatedAsync(TeamCreatedEvent teamCreated);
        Task PublishTeamJoinedAsync(TeamJoinedEvent teamJoined);
        Task PublishTeamLeftAsync(TeamLeftEvent teamLeft);
        Task PublishTeamDeletedAsync(TeamDeletedEvent teamDeleted);
    }
}
