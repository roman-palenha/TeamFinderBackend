namespace TeamFinder.NotificationService.API.Models
{
    public class EmailNotificationRequest
    {
        public string Email { get; set; } = string.Empty;
        public Notification Notification { get; set; } = new Notification();
    }
}
