using ATSScanner.Data;
using ATSScanner.Services;
using ATSScanner.Models;
using Microsoft.EntityFrameworkCore;
using OpenAI;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Configure global HTTP client settings for SSL resilience
System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12 | System.Net.SecurityProtocolType.Tls13;
System.Net.ServicePointManager.DefaultConnectionLimit = 50;
System.Net.ServicePointManager.Expect100Continue = false;
System.Net.ServicePointManager.UseNagleAlgorithm = false;

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<PdfParserService>();
builder.Services.AddScoped<OpenAIService>();
builder.Services.AddScoped<AtsScoringService>();
builder.Services.AddScoped<DocumentParserService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<MembershipService>();




// Add OpenAI client with SSL configuration
builder.Services.AddSingleton<OpenAIClient>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var apiKey = configuration["OpenAI:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    
    if (string.IsNullOrEmpty(apiKey))
    {
        throw new InvalidOperationException("OpenAI API key not found. Please set it in appsettings.Development.json or as an environment variable OPENAI_API_KEY");
    }
    
    return new OpenAIClient(apiKey);
});

// Configure the database with retry logic
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins(
                "http://localhost:3000",  // Local development (React)
                "https://localhost:3000", // Local development HTTPS (React)
                "https://localhost:7291", // Local development (Backend)
                "https://atsscanner-personal-server-gbhacthqdpakayf3.canadacentral-01.azurewebsites.net", // Your actual Azure App Service (serves both frontend & backend)
                "https://resumatrix.co", // Custom domain
                "https://www.resumatrix.co", // Custom domain with www
                "https://atsscanner-personal-server.azurewebsites.net" // Allow self-requests (if needed)
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<DataContext>();
        context.Database.EnsureCreated();
        
        // Seed membership plans if they don't exist
        if (!context.MembershipPlans.Any())
        {
            var plans = new List<MembershipPlan>
            {
                new MembershipPlan
                {
                    Name = "Free",
                    Type = MembershipType.Free,
                    Price = 0,
                    ScanLimit = 3,
                    IsActive = true,
                    HasPrioritySupport = false,
                    HasAdvancedAnalytics = false,
                    HasBulkUpload = false
                },
                new MembershipPlan
                {
                    Name = "Basic",
                    Type = MembershipType.Basic,
                    Price = 9.99m,
                    ScanLimit = -1, // Unlimited
                    IsActive = true,
                    HasPrioritySupport = false,
                    HasAdvancedAnalytics = true,
                    HasBulkUpload = false,
                    StripePriceId = "price_1Rkxg0PNK7jJq4OFQHnkYH5t" // Real Stripe price ID
                },
                new MembershipPlan
                {
                    Name = "Premium",
                    Type = MembershipType.Premium,
                    Price = 19.99m,
                    ScanLimit = -1, // Unlimited
                    IsActive = true,
                    HasPrioritySupport = true,
                    HasAdvancedAnalytics = true,
                    HasBulkUpload = true,
                    StripePriceId = "price_1RkxhuPNK7jJq4OFIyglilE4" // Real Stripe price ID
                }
            };
            
            context.MembershipPlans.AddRange(plans);
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating/migrating the database.");
    }
}




app.Run();
