using InternProject.DTOs;

namespace InternProject.Services.Interfaces
{
    public interface IPointService
    {
        Task<List<PointResponseDto>> GetAllAsync();
        Task<PointResponseDto?> GetByIdAsync(int id);
        Task<PointResponseDto?> CreateAsync(PointCreateDto dto);
        Task<bool> UpdateAsync(PointUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
