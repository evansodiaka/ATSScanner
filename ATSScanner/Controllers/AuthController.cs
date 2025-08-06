// ATSScanner/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using ATSScanner.Models;
using ATSScanner.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;
    public AuthController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDto dto)
    {
        var user = await _userService.RegisterUserAsync(dto);
        if (user == null)
            return BadRequest("Username or email already exists.");

        return Ok(new { user.Id, user.Username, user.Email });
    }
  
    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto dto)
    {
        var user = await _userService.AuthenticateUserAsync(dto.UsernameOrEmail, dto.Password);
        if (user == null)
            return Unauthorized("Invalid credentials.");

        var token = _userService.GenerateJwtToken(user);
        if (string.IsNullOrEmpty(token))
            return Unauthorized("Failed to generate token.");

        return Ok(new { 
            token = token,
            username = user.Username,
            email = user.Email
        });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDto dto)
    {
        try
        {
            Console.WriteLine("=== GOOGLE AUTH DEBUG ===");
            Console.WriteLine($"Request method: {Request.Method}");
            Console.WriteLine($"Request path: {Request.Path}");
            Console.WriteLine($"Content-Type: {Request.ContentType}");
            Console.WriteLine($"User-Agent: {Request.Headers.UserAgent}");
            Console.WriteLine($"Origin: {Request.Headers.Origin}");
            Console.WriteLine($"Dto is null: {dto == null}");
            Console.WriteLine($"IdToken is null or empty: {string.IsNullOrEmpty(dto?.IdToken)}");
            
            if (dto?.IdToken != null && dto.IdToken.Length > 50)
                Console.WriteLine($"Received Google auth request with token: {dto.IdToken.Substring(0, 50)}...");
            else
                Console.WriteLine($"Full token: {dto?.IdToken}");
            
            // Check for null or empty ID token
            if (string.IsNullOrEmpty(dto?.IdToken))
            {
                Console.WriteLine("Google authentication failed - ID token is null or empty");
                return BadRequest("ID token is required.");
            }
            
            var user = await _userService.AuthenticateGoogleUserAsync(dto.IdToken);
            if (user == null)
            {
                Console.WriteLine("Google authentication failed - user is null");
                return Unauthorized("Invalid Google token.");
            }

            var token = _userService.GenerateJwtToken(user);
            Console.WriteLine($"Generated JWT token for user: {user.Username}");
            
            return Ok(new { 
                token = token,
                username = user.Username,
                email = user.Email
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Google auth error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("protected")]
    public IActionResult ProtectedEndpoint()
    {
        return Ok("You are authenticated!");
    }

}