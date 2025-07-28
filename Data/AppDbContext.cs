using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using InternProject.Models;

namespace InternProject.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<GeoPoint> Points { get; set; }
        public DbSet<GeoLine> Lines { get; set; }
        public DbSet<GeoPolygon> Polygons { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GeoPoint>(entity =>
            {
                entity.HasKey(p => p.Id);

                entity.Property(p => p.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(256);

                entity.Property(p => p.Location)
                      .HasColumnType("geometry (Point, 4326)");
                base.OnModelCreating(modelBuilder);

                modelBuilder.Entity<GeoLine>(entity =>
                {
                    entity.HasKey(e => e.Id);
                    entity.Property(e => e.Line).HasColumnType("geometry (LineString, 4326)");
                });


                modelBuilder.Entity<GeoPolygon>(entity =>
                {
                    entity.HasKey(e => e.Id);
                    entity.Property(e => e.Polygon).HasColumnType("geometry (Polygon, 4326)");
                });
               
                
                     




            });
        }
    }
}
