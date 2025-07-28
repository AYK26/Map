using InternProject.Models;

namespace InternProject.DTOs
{
    public class PointResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public double PointX { get; set; }
        public double PointY { get; set; }
       
    }
}
