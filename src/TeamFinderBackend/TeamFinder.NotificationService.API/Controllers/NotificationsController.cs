using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.NotificationService.API.Models;
using TeamFinder.NotificationService.API.Services;

namespace TeamFinder.NotificationService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        // Test endpoint to send a notification to all users
        [HttpPost("broadcast")]
        public async Task<IActionResult> BroadcastNotification([FromBody] Notification notification)
        {
            try
            {
                await _notificationService.SendToAllAsync(notification);
                return Ok(new { message = "Notification broadcast successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error broadcasting notification");
                return StatusCode(500, new { message = "Failed to broadcast notification" });
            }
        }

        // Test endpoint to send a notification to a specific user
        [HttpPost("user/{userId}")]
        public async Task<IActionResult> SendToUser(Guid userId, [FromBody] Notification notification)
        {
            try
            {
                await _notificationService.SendToUserAsync(userId, notification);
                return Ok(new { message = $"Notification sent to user {userId} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending notification to user {userId}");
                return StatusCode(500, new { message = $"Failed to send notification to user {userId}" });
            }
        }

        // Test endpoint to send a notification to a specific team
        [HttpPost("team/{teamId}")]
        public async Task<IActionResult> SendToTeam(Guid teamId, [FromBody] Notification notification)
        {
            try
            {
                await _notificationService.SendToTeamAsync(teamId, notification);
                return Ok(new { message = $"Notification sent to team {teamId} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending notification to team {teamId}");
                return StatusCode(500, new { message = $"Failed to send notification to team {teamId}" });
            }
        }

        [HttpPost("email")]
        public async Task<IActionResult> SendEmail([FromBody] EmailNotificationRequest request)
        {
            try
            {
                await _notificationService.SendEmailToUserAsync(request.Email, request.Notification);
                return Ok(new { message = $"Email notification sent to {request.Email} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email notification to {request.Email}");
                return StatusCode(500, new { message = $"Failed to send email notification to {request.Email}" });
            }
        }
    }
}
