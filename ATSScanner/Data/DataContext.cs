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
        public DbSet<UsageTracking> UsageTrackings { get; set; }
        public DbSet<Membership> Memberships { get; set; }
        public DbSet<MembershipPlan> MembershipPlans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure decimal precision for Price
            modelBuilder.Entity<MembershipPlan>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            base.OnModelCreating(modelBuilder);
        }
    }
}