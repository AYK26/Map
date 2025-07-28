using InternProject.DTOs;
using InternProject.Services;
using InternProject.Services.Interfaces;
using InternProject.Wrappers;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InternProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LineController : ControllerBase
    {
        private readonly ILineService _lineService;

        public LineController(ILineService lineService)
        {
            _lineService = lineService;
        }

        [HttpGet]
        public async Task<ActionResult<Response<List<LineResponseDto>>>> GetAll()
        {
            var data = await _lineService.GetAllAsync();
            return Ok(new Response<List<LineResponseDto>>(data));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Response<LineResponseDto>>> GetById(int id)
        {
            var data = await _lineService.GetByIdAsync(id);
            if (data == null)
                return NotFound(new Response<LineResponseDto>(null!, "Kayıt bulunamadı", false));

            return Ok(new Response<LineResponseDto>(data));
        }

        [HttpPost]
        public async Task<ActionResult<Response<LineResponseDto>>> Create(LineCreateDto dto)
        {
            var result = await _lineService.CreateAsync(dto);
            if (result == null)
                return BadRequest(new Response<LineResponseDto>(null!, "Doğrulama başarısız oldu", false));

            return Ok(new Response<LineResponseDto>(result));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] LineUpdateDto dto)
        {
            dto.Id = id; // Path’ten gelen id’yi DTO’ya ata (güvenli ve net)
            var success = await _lineService.UpdateAsync(dto);
            if (!success)
                return NotFound(new Response<string>(null!, "Güncellenecek kayıt bulunamadı veya geçersiz veri", false));

            return Ok(new Response<string>("Başarıyla güncellendi"));
        }

        /*[HttpPut]
        public async Task<IActionResult> Update(LineUpdateDto dto)
        {
            var success = await _lineService.UpdateAsync(dto);
            if (!success)
                return NotFound(new Response<string>(null!, "Güncellenecek kayıt bulunamadı veya geçersiz veri", false));

            return Ok(new Response<string>("Başarıyla güncellendi"));
        }
        */

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _lineService.DeleteAsync(id);
            if (!success)
                return NotFound(new Response<string>(null!, "Silinecek kayıt bulunamadı", false));

            return Ok(new Response<string>("Başarıyla silindi"));
        }
    }
}
