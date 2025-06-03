namespace TeamFinder.TeamMatchingService.API.Models
{
    public class Team
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Game { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string SkillLevel { get; set; } = string.Empty;
        public int MaxPlayers { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid OwnerId { get; set; }
        public bool IsOpen { get; set; } = true;
        public List<TeamMember> Members { get; set; } = new List<TeamMember>();
    }

    public class TeamMember
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public Guid TeamId { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public TeamRole Role { get; set; } = TeamRole.Member;
    }

    public enum TeamRole
    {
        Owner,
        Captain,
        Member
    }

    public class TeamDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Game { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string SkillLevel { get; set; } = string.Empty;
        public int MaxPlayers { get; set; }
        public int CurrentPlayers { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid OwnerId { get; set; }
        public bool IsOpen { get; set; }
        public List<TeamMemberDto> Members { get; set; } = new List<TeamMemberDto>();
    }

    public class TeamMemberDto
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public TeamRole Role { get; set; }
    }

    public class CreateTeamRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Game { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string SkillLevel { get; set; } = string.Empty;
        public int MaxPlayers { get; set; }
        public Guid OwnerId { get; set; }
    }

    public class JoinTeamRequest
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    public class TeamMatchRequest
    {
        public string Game { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string SkillLevel { get; set; } = string.Empty;
    }
}
