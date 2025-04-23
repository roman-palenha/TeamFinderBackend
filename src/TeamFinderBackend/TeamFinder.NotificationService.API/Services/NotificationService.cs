using Microsoft.AspNetCore.SignalR;
using TeamFinder.NotificationService.API.Hubs;
using TeamFinder.NotificationService.API.Models;

namespace TeamFinder.NotificationService.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendToAllAsync(Notification notification)
        {
            try
            {
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);
                _logger.LogInformation($"Sent notification to all clients: {notification.Type}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to all clients");
            }
        }

        public async Task SendToUserAsync(Guid userId, Notification notification)
        {
            try
            {
                await _hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", notification);
                _logger.LogInformation($"Sent notification to user {userId}: {notification.Type}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending notification to user {userId}");
            }
        }

        public async Task SendToTeamAsync(Guid teamId, Notification notification)
        {
            try
            {
                await _hubContext.Clients.Group($"team-{teamId}").SendAsync("ReceiveNotification", notification);
                _logger.LogInformation($"Sent notification to team {teamId}: {notification.Type}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending notification to team {teamId}");
            }
        }
    }
}
