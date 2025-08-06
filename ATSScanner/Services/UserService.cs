// ATSScanner/Services/UserService.cs
using ATSScanner.Models;
using ATSScanner.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BCrypt.Net;
using System.Text;

public class UserService
{
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;

    public UserService(DataContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<bool> UserExists(string username, string email)
    {
        return await _context.Users.AnyAsync(u => u.Username == username || u.Email == email);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }

    public async Task<User> RegisterUserAsync(UserRegisterDto dto)
    {
        if (await UserExists(dto.Username, dto.Email))
            return null;

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
  
    public async Task<User> AuthenticateUserAsync(string usernameOrEmail, string password)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == usernameOrEmail || u.Email == usernameOrEmail);

        if (user == null)
            return null;

        if (!VerifyPassword(password, user.PasswordHash))
            return null;

        return user;
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings["Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpiresInMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User> AuthenticateGoogleUserAsync(string idToken)
    {
        try
        {
            Console.WriteLine($"=== GOOGLE TOKEN VALIDATION DEBUG ===");
            Console.WriteLine($"Token length: {idToken?.Length}");
            Console.WriteLine($"Token starts with: {idToken?.Substring(0, Math.Min(20, idToken.Length ?? 0))}");
            
            // Verify Google ID token with Google's servers
            using var httpClient = new HttpClient();
            var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";
            Console.WriteLine($"Making request to: {url.Substring(0, Math.Min(100, url.Length))}...");
            
            var response = await httpClient.GetAsync(url);
            Console.WriteLine($"Google API response status: {response.StatusCode}");
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Google API error: {errorContent}");
                return null;
            }

            var payload = await response.Content.ReadAsStringAsync();
            var googleUser = System.Text.Json.JsonSerializer.Deserialize<GoogleTokenPayload>(payload);

            if (googleUser?.email == null)
                return null;

            // Find existing user or create new one
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == googleUser.email);
            if (user == null)
            {
                user = new User
                {
                    Username = googleUser.name ?? googleUser.email.Split('@')[0],
                    Email = googleUser.email,
                    PasswordHash = HashPassword(Guid.NewGuid().ToString()) // Random password for Google users
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            return user;
        }
        catch
        {
            return null;
        }
    }
}

public class GoogleTokenPayload
{
    public string email { get; set; }
    public string name { get; set; }
    public string picture { get; set; }
}