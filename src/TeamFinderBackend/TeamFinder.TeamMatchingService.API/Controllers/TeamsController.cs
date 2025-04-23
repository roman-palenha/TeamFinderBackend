using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.TeamMatchingService.API.Models;
using TeamFinder.TeamMatchingService.API.Services;

namespace TeamFinder.TeamMatchingService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamsController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamsController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TeamDto>> CreateTeam(CreateTeamRequest request)
        {
            try
            {
                var team = await _teamService.CreateTeamAsync(request);
                return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TeamDto>> GetTeam(Guid id)
        {
            try
            {
                var team = await _teamService.GetTeamByIdAsync(id);
                return Ok(team);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Team not found" });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeams([FromQuery] string? game = null, [FromQuery] string? platform = null, [FromQuery] string? skillLevel = null)
        {
            var teams = await _teamService.GetTeamsAsync(game, platform, skillLevel);
            return Ok(teams);
        }

        [HttpPost("{id}/join")]
        [Authorize]
        public async Task<ActionResult<TeamDto>> JoinTeam(Guid id, JoinTeamRequest request)
        {
            try
            {
                var team = await _teamService.JoinTeamAsync(id, request);
                return Ok(team);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/leave")]
        [Authorize]
        public async Task<ActionResult> LeaveTeam(Guid id, [FromBody] Guid userId)
        {
            try
            {
                var result = await _teamService.LeaveTeamAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "Team or user not found" });
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteTeam(Guid id, [FromQuery] Guid userId)
        {
            try
            {
                var result = await _teamService.DeleteTeamAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "Team not found" });
                }
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPost("match")]
        public async Task<ActionResult<IEnumerable<TeamDto>>> MatchTeam(TeamMatchRequest request)
        {
            var teams = await _teamService.MatchTeamAsync(request);
            return Ok(teams);
        }
    }
}
