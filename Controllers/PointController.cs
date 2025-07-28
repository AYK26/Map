using InternProject.DTOs;
using InternProject.Services.Interfaces;
using InternProject.Validators;
using InternProject.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace InternProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PointController : ControllerBase
    {
        private readonly IPointService _pointService;

        public PointController(IPointService pointService)
        {
            _pointService = pointService;
        }

        [HttpGet]
        public async Task<ActionResult<Response<List<PointResponseDto>>>> GetAll()
        {
            var data = await _pointService.GetAllAsync();
            return Ok(new Response<List<PointResponseDto>>(data));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Response<PointResponseDto>>> GetById(int id)
        {
            var data = await _pointService.GetByIdAsync(id);
            if (data == null)
                return NotFound(new Response<PointResponseDto>(null!, "Kayıt bulunamadı", false));

            return Ok(new Response<PointResponseDto>(data));
        }

        [HttpPost]
        public async Task<ActionResult<Response<PointResponseDto>>> Create(PointCreateDto dto)
        {
            if (!PointValidator.IsValid(dto, out var error))
                return BadRequest(new Response<PointResponseDto>(null!, error, false));

            var result = await _pointService.CreateAsync(dto);
           return Ok(new Response<PointResponseDto>(result));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PointUpdateDto dto)
        {
            dto.Id = id; // Path’ten gelen id’yi DTO’ya ata
            if (!PointValidator.IsValid(dto, out var error))
                return BadRequest(new Response<string>(null!, error, false));

            var success = await _pointService.UpdateAsync(dto);
            if (!success)
                return NotFound(new Response<string>(null!, "Güncellenecek kayıt bulunamadı", false));

            return Ok(new Response<string>("Başarıyla güncellendi"));
        }
        /* [HttpPut]
         public async Task<IActionResult> Update(PointUpdateDto dto)
         {
             if (!PointValidator.IsValid(dto, out var error))
                 return BadRequest(new Response<string>(null!, error, false));

             var success = await _pointService.UpdateAsync(dto);
             if (!success)
                 return NotFound(new Response<string>(null!, "Güncellenecek kayıt bulunamadı", false));

             return Ok(new Response<string>("Başarıyla güncellendi"));
         }
        */

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _pointService.DeleteAsync(id);
            if (!success)
                return NotFound(new Response<string>(null!, "Silinecek kayıt bulunamadı", false));

            return Ok(new Response<string>("Başarıyla silindi"));
        }
    }
}
