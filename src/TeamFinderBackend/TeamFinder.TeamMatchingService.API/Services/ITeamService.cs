using TeamFinder.TeamMatchingService.API.Models;

namespace TeamFinder.TeamMatchingService.API.Services
{
    public interface ITeamService
    {
        Task<TeamDto> CreateTeamAsync(CreateTeamRequest request);
        Task<TeamDto> GetTeamByIdAsync(Guid id);
        Task<IEnumerable<TeamDto>> GetTeamsAsync(string? game = null, string? platform = null, string? skillLevel = null);
        Task<TeamDto> JoinTeamAsync(Guid teamId, JoinTeamRequest request);
        Task<bool> LeaveTeamAsync(Guid teamId, Guid userId);
        Task<bool> DeleteTeamAsync(Guid teamId, Guid userId);
        Task<IEnumerable<TeamDto>> MatchTeamAsync(TeamMatchRequest request);
    }
}
