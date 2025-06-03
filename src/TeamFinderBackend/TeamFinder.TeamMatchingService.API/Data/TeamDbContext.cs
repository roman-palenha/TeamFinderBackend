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
            modelBuilder.Entity<Team>()
                .HasIndex(t => t.Name)
                .IsUnique();

            modelBuilder.Entity<TeamMember>()
                .HasIndex(tm => new { tm.UserId, tm.TeamId })
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Id)
                .IsUnique();
        }
    }
}
