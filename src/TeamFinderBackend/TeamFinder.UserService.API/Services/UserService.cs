using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TeamFinder.UserService.API.Data;
using TeamFinder.UserService.API.Models;

namespace TeamFinder.UserService.API.Services
{
    public class UserService : IUserService
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMessagePublisher _messagePublisher;

        public UserService(UserDbContext context, IConfiguration configuration, IMessagePublisher messagePublisher)
        {
            _context = context;
            _configuration = configuration;
            _messagePublisher = messagePublisher;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new InvalidOperationException("User with this email already exists");
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                throw new InvalidOperationException("Username is already taken");
            }

            // Create new user
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                GamingPlatform = request.GamingPlatform,
                PreferredGame = request.PreferredGame,
                SkillLevel = request.SkillLevel,
                CreatedAt = DateTime.UtcNow
            };

            // Save user to database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Publish user registered event
            await _messagePublisher.PublishUserRegisteredAsync(new UserRegisteredEvent
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email
            });

            // Generate token
            var token = GenerateJwtToken(user);

            // Return response
            return new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id.ToString(),
                    Username = user.Username,
                    Email = user.Email,
                    GamingPlatform = user.GamingPlatform,
                    PreferredGame = user.PreferredGame,
                    SkillLevel = user.SkillLevel
                }
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            // Find user by email
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == request.Email);

            // Verify user exists and password is correct
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new InvalidOperationException("Invalid email or password");
            }

            // Generate token
            var token = GenerateJwtToken(user);

            // Return response
            return new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id.ToString(),
                    Username = user.Username,
                    Email = user.Email,
                    GamingPlatform = user.GamingPlatform,
                    PreferredGame = user.PreferredGame,
                    SkillLevel = user.SkillLevel
                }
            };
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            return new UserDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                GamingPlatform = user.GamingPlatform,
                PreferredGame = user.PreferredGame,
                SkillLevel = user.SkillLevel
            };
        }

        public async Task<UserDto> UpdateUserAsync(Guid id, UserDto userDto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            // Update user properties
            user.Username = userDto.Username;
            user.Email = userDto.Email;
            user.GamingPlatform = userDto.GamingPlatform;
            user.PreferredGame = userDto.PreferredGame;
            user.SkillLevel = userDto.SkillLevel;

            await _context.SaveChangesAsync();

            // Publish user updated event
            await _messagePublisher.PublishUserUpdatedAsync(new UserUpdatedEvent
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email
            });

            return userDto;
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            // Publish user deleted event
            await _messagePublisher.PublishUserDeletedAsync(new UserDeletedEvent
            {
                UserId = id
            });

            return true;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            return await _context.Users.Select(u => new UserDto
            {
                Username = u.Username,
                Email = u.Email,
                GamingPlatform = u.GamingPlatform,
                PreferredGame = u.PreferredGame,
                SkillLevel = u.SkillLevel
            }).ToListAsync();
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "defaultkeyshouldbereplaced"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("username", user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
