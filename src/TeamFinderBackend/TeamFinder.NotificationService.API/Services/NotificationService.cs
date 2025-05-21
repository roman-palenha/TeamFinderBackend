using Microsoft.AspNetCore.SignalR;
using TeamFinder.NotificationService.API.Hubs;
using TeamFinder.NotificationService.API.Models;

namespace TeamFinder.NotificationService.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;
        private readonly IEmailService _emailService;

        public NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger, IEmailService emailService)
        {
            _hubContext = hubContext;
            _logger = logger;
            _emailService = emailService;
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

        public async Task SendEmailToUserAsync(string email, Notification notification)
        {
            try
            {
                await _emailService.SendEmailNotificationAsync(email, notification);
                _logger.LogInformation($"Sent email notification to {email}: {notification.Type}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email notification to {email}");
                throw;
            }
        }

        public async Task SendEmailToUsersAsync(IEnumerable<string> emails, Notification notification)
        {
            var tasks = new List<Task>();
            foreach (var email in emails)
            {
                tasks.Add(SendEmailToUserAsync(email, notification));
            }

            try
            {
                await Task.WhenAll(tasks);
                _logger.LogInformation($"Sent email notification to {emails.Count()} recipients: {notification.Type}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending batch email notifications");
                throw;
            }
        }
    }
}
