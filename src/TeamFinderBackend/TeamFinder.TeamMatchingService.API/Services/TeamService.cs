using Microsoft.EntityFrameworkCore;
using TeamFinder.TeamMatchingService.API.Data;
using TeamFinder.TeamMatchingService.API.Models;

namespace TeamFinder.TeamMatchingService.API.Services
{
    public class TeamService : ITeamService
    {
        private readonly TeamDbContext _context;
        private readonly IMessagePublisher _messagePublisher;

        public TeamService(TeamDbContext context, IMessagePublisher messagePublisher)
        {
            _context = context;
            _messagePublisher = messagePublisher;
        }

        public async Task<TeamDto> CreateTeamAsync(CreateTeamRequest request)
        {
            if (await _context.Teams.AnyAsync(t => t.Name == request.Name))
            {
                throw new InvalidOperationException("Team name already exists");
            }

            var user = await _context.Users.FindAsync(request.OwnerId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            var team = new Team
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Game = request.Game,
                Platform = request.Platform,
                SkillLevel = request.SkillLevel,
                MaxPlayers = request.MaxPlayers,
                OwnerId = request.OwnerId,
                CreatedAt = DateTime.UtcNow,
                IsOpen = true
            };

            var teamMember = new TeamMember
            {
                Id = Guid.NewGuid(),
                UserId = request.OwnerId,
                Username = user.Username,
                TeamId = team.Id,
                JoinedAt = DateTime.UtcNow,
                Role = TeamRole.Owner
            };

            _context.Teams.Add(team);
            _context.TeamMembers.Add(teamMember);
            await _context.SaveChangesAsync();

            await _messagePublisher.PublishTeamCreatedAsync(new TeamCreatedEvent
            {
                TeamId = team.Id,
                TeamName = team.Name,
                OwnerId = team.OwnerId
            });

            return new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
                Game = team.Game,
                Platform = team.Platform,
                SkillLevel = team.SkillLevel,
                MaxPlayers = team.MaxPlayers,
                CurrentPlayers = 1,
                CreatedAt = team.CreatedAt,
                OwnerId = team.OwnerId,
                IsOpen = team.IsOpen,
                Members = new List<TeamMemberDto>
                {
                    new TeamMemberDto
                    {
                        UserId = teamMember.UserId,
                        Username = teamMember.Username,
                        JoinedAt = teamMember.JoinedAt,
                        Role = teamMember.Role
                    }
                }
            };
        }

        public async Task<TeamDto> GetTeamByIdAsync(Guid id)
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (team == null)
            {
                throw new KeyNotFoundException("Team not found");
            }

            return MapTeamToDto(team);
        }

        public async Task<IEnumerable<TeamDto>> GetTeamsAsync(string? game = null, string? platform = null, string? skillLevel = null)
        {
            IQueryable<Team> query = _context.Teams.Include(t => t.Members);

            if (!string.IsNullOrEmpty(game))
            {
                query = query.Where(t => t.Game == game);
            }

            if (!string.IsNullOrEmpty(platform))
            {
                query = query.Where(t => t.Platform == platform);
            }

            if (!string.IsNullOrEmpty(skillLevel))
            {
                query = query.Where(t => t.SkillLevel == skillLevel);
            }

            var teams = await query.ToListAsync();

            return teams.Select(MapTeamToDto);
        }

        public async Task<TeamDto> JoinTeamAsync(Guid teamId, JoinTeamRequest request)
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null)
            {
                throw new KeyNotFoundException("Team not found");
            }

            if (!team.IsOpen)
            {
                throw new InvalidOperationException("Team is not open for new members");
            }

            if (team.Members.Count >= team.MaxPlayers)
            {
                throw new InvalidOperationException("Team is already full");
            }

            if (team.Members.Any(m => m.UserId == request.UserId))
            {
                throw new InvalidOperationException("User is already a member of this team");
            }

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            var teamMember = new TeamMember
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Username = request.Username,
                TeamId = teamId,
                JoinedAt = DateTime.UtcNow,
                Role = TeamRole.Member
            };

            _context.TeamMembers.Add(teamMember);
            await _context.SaveChangesAsync();

            await _messagePublisher.PublishTeamJoinedAsync(new TeamJoinedEvent
            {
                TeamId = team.Id,
                TeamName = team.Name,
                UserId = request.UserId,
                Username = request.Username
            });

            return MapTeamToDto(team);
        }

        public async Task<bool> LeaveTeamAsync(Guid teamId, Guid userId)
        {
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);

            if (teamMember == null)
            {
                return false;
            }

            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null)
            {
                return false;
            }

            if (teamMember.Role == TeamRole.Owner)
            {
                throw new InvalidOperationException("Team owner cannot leave the team. Transfer ownership or delete the team.");
            }

            _context.TeamMembers.Remove(teamMember);
            await _context.SaveChangesAsync();

            await _messagePublisher.PublishTeamLeftAsync(new TeamLeftEvent
            {
                TeamId = team.Id,
                TeamName = team.Name,
                UserId = userId,
                Username = teamMember.Username
            });

            return true;
        }

        public async Task<bool> DeleteTeamAsync(Guid teamId, Guid userId)
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null)
            {
                return false;
            }

            if (team.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("Only the team owner can delete the team");
            }

            _context.TeamMembers.RemoveRange(team.Members);
            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();

            await _messagePublisher.PublishTeamDeletedAsync(new TeamDeletedEvent
            {
                TeamId = team.Id,
                TeamName = team.Name
            });

            return true;
        }

        public async Task<IEnumerable<TeamDto>> MatchTeamAsync(TeamMatchRequest request)
        {
            var matchingTeams = await _context.Teams
                .Include(t => t.Members)
                .Where(t =>
                    t.Game == request.Game &&
                    t.Platform == request.Platform &&
                    t.SkillLevel == request.SkillLevel &&
                    t.IsOpen &&
                    t.Members.Count < t.MaxPlayers)
                .ToListAsync();

            var orderedTeams = matchingTeams
                .OrderByDescending(t => t.MaxPlayers - t.Members.Count);

            return orderedTeams.Select(MapTeamToDto);
        }

        private TeamDto MapTeamToDto(Team team)
        {
            return new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
                Game = team.Game,
                Platform = team.Platform,
                SkillLevel = team.SkillLevel,
                MaxPlayers = team.MaxPlayers,
                CurrentPlayers = team.Members.Count,
                CreatedAt = team.CreatedAt,
                OwnerId = team.OwnerId,
                IsOpen = team.IsOpen,
                Members = team.Members.Select(m => new TeamMemberDto
                {
                    UserId = m.UserId,
                    Username = m.Username,
                    JoinedAt = m.JoinedAt,
                    Role = m.Role
                }).ToList()
            };
        }
    }
}
