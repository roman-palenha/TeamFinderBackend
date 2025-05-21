using TeamFinder.NotificationService.API.Models;

namespace TeamFinder.NotificationService.API.Services
{
    public interface INotificationService
    {
        Task SendToAllAsync(Notification notification);
        Task SendToUserAsync(Guid userId, Notification notification);
        Task SendToTeamAsync(Guid teamId, Notification notification);
        Task SendEmailToUserAsync(string email, Notification notification);
        Task SendEmailToUsersAsync(IEnumerable<string> emails, Notification notification);
    }
}
