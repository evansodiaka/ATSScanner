using Microsoft.EntityFrameworkCore;
using ATSScanner.Models;

namespace ATSScanner.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<Resume> Resumes { get; set; }
        public DbSet<ResumeAnalysis> ResumeAnalyses { get; set; }
    }
}