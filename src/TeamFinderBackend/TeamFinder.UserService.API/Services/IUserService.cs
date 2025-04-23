using TeamFinder.UserService.API.Models;

namespace TeamFinder.UserService.API.Services
{
    public interface IUserService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<UserDto> UpdateUserAsync(Guid id, UserDto userDto);
        Task<bool> DeleteUserAsync(Guid id);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
    }
}
