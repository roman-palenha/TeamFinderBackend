using TeamFinder.NotificationService.API.Models;

namespace TeamFinder.NotificationService.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendEmailNotificationAsync(string to, Notification notification);
    }
}
