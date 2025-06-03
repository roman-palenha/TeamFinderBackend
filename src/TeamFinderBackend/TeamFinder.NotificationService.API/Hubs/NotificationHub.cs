using Microsoft.AspNetCore.SignalR;

namespace TeamFinder.NotificationService.API.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            _logger.LogInformation($"Client {Context.ConnectionId} joined user group: user-{userId}");
        }

        public async Task JoinTeamGroup(string teamId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"team-{teamId}");
            _logger.LogInformation($"Client {Context.ConnectionId} joined team group: team-{teamId}");
        }

        public async Task LeaveUserGroup(string userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
            _logger.LogInformation($"Client {Context.ConnectionId} left user group: user-{userId}");
        }

        public async Task LeaveTeamGroup(string teamId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"team-{teamId}");
            _logger.LogInformation($"Client {Context.ConnectionId} left team group: team-{teamId}");
        }
    }
}
