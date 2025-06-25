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
        var user = await _userService.AuthenticateGoogleUserAsync(dto.IdToken);
        if (user == null)
            return Unauthorized("Invalid Google token.");

        var token = _userService.GenerateJwtToken(user);
        return Ok(new { 
            token = token,
            username = user.Username,
            email = user.Email
        });
    }

    [Authorize]
    [HttpGet("protected")]
    public IActionResult ProtectedEndpoint()
    {
        return Ok("You are authenticated!");
    }

}