using Microsoft.EntityFrameworkCore;
using ATSScanner.Models;

namespace ATSScanner.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<Resume> Resumes { get; set; }
        public DbSet<ResumeAnalysis> ResumeAnalyses { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<UsageTracking> UsageTrackings { get; set; }
        public DbSet<Membership> Memberships { get; set; }
        public DbSet<MembershipPlan> MembershipPlans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure decimal precision for Price
            modelBuilder.Entity<MembershipPlan>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            // Configure User-UserProfile relationship (One-to-One)
            modelBuilder.Entity<UserProfile>()
                .HasOne(up => up.User)
                .WithOne()
                .HasForeignKey<UserProfile>(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure unique relationship (one profile per user)
            modelBuilder.Entity<UserProfile>()
                .HasIndex(up => up.UserId)
                .IsUnique();

            base.OnModelCreating(modelBuilder);
        }
    }
}