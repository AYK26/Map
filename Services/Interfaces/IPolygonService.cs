using InternProject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InternProject.Services.Interfaces
{
    public interface IPolygonService
    {
        Task<List<PolygonResponseDto>> GetAllAsync();
        Task<PolygonResponseDto?> GetByIdAsync(int id);
        Task<PolygonResponseDto?> CreateAsync(PolygonCreateDto dto);
        Task<bool> UpdateAsync(PolygonUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
