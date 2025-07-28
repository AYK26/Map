using InternProject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InternProject.Services.Interfaces
{
    public interface ILineService
    {
        Task<List<LineResponseDto>> GetAllAsync();
        Task<LineResponseDto?> GetByIdAsync(int id);
        Task<LineResponseDto?> CreateAsync(LineCreateDto dto);
        Task<bool> UpdateAsync(LineUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
