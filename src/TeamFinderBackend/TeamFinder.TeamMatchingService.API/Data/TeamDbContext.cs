using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using TeamFinder.TeamMatchingService.API.Models;

namespace TeamFinder.TeamMatchingService.API.Data
{
    public class TeamDbContext : DbContext
    {
        public TeamDbContext(DbContextOptions<TeamDbContext> options) : base(options)
        {
        }

        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Team entity
            modelBuilder.Entity<Team>()
                .HasIndex(t => t.Name)
                .IsUnique();

            // Configure TeamMember entity
            modelBuilder.Entity<TeamMember>()
                .HasIndex(tm => new { tm.UserId, tm.TeamId })
                .IsUnique();

            // Configure User entity
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Id)
                .IsUnique();
        }
    }
}
