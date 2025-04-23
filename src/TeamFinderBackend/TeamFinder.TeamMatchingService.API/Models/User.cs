namespace TeamFinder.TeamMatchingService.API.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string GamingPlatform { get; set; } = string.Empty;
        public string PreferredGame { get; set; } = string.Empty;
        public string SkillLevel { get; set; } = string.Empty;
    }
}
