using InternProject.Models;

namespace InternProject.DTOs
{
    public class PolygonResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string WKT { get; set; } = null!;
      
    }
}
