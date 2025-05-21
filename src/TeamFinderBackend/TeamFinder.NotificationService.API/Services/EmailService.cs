using System.Net;
using System.Net.Mail;
using TeamFinder.NotificationService.API.Models;

namespace TeamFinder.NotificationService.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var fromEmail = smtpSettings["FromEmail"] ?? "";
                var fromName = smtpSettings["FromName"];
                var smtpServer = smtpSettings["Server"];
                var port = int.Parse(smtpSettings["Port"] ?? "587");
                var username = smtpSettings["Username"];
                var password = smtpSettings["Password"];
                var enableSsl = bool.Parse(smtpSettings["EnableSsl"] ?? "true");


                using var client = new SmtpClient(smtpServer, port)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = enableSsl
                };

                await client.SendMailAsync(new MailMessage(from: fromEmail, to: to, subject, body));
                _logger.LogInformation($"Email sent to {to} with subject: {subject}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email to {to}");
                throw;
            }
        }

        public async Task SendEmailNotificationAsync(string to, Notification notification)
        {
            var subject = $"Notification: {notification.Type}";
            var body = $@"
                <html>
                <body>
                    <h2>{notification.Type}</h2>
                    <p>{notification.Message}</p>
                </body>
                </html>";

            await SendEmailAsync(to, subject, body);
        }
    }
}
