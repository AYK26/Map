using InternProject.DTOs;
using InternProject.Services;
using InternProject.Services.Interfaces;
using InternProject.Validators;
using InternProject.Wrappers;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InternProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PolygonController : ControllerBase
    {
        private readonly IPolygonService _polygonService;

        public PolygonController(IPolygonService polygonService)
        {
            _polygonService = polygonService;
        }

        [HttpGet]
        public async Task<ActionResult<Response<List<PolygonResponseDto>>>> GetAll()
        {
            var data = await _polygonService.GetAllAsync();
            return Ok(new Response<List<PolygonResponseDto>>(data));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Response<PolygonResponseDto>>> GetById(int id)
        {
            var data = await _polygonService.GetByIdAsync(id);
            if (data == null)
                return NotFound(new Response<PolygonResponseDto>(null!, "Kayıt bulunamadı", false));

            return Ok(new Response<PolygonResponseDto>(data));
        }

        [HttpPost]
        public async Task<ActionResult<Response<PolygonResponseDto>>> Create(PolygonCreateDto dto)
        {
            var result = await _polygonService.CreateAsync(dto);
            if (result == null)
                return BadRequest(new Response<PolygonResponseDto>(null!, "Doğrulama başarısız oldu", false));

            return Ok(new Response<PolygonResponseDto>(result));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PolygonUpdateDto dto)
        {
            Console.WriteLine($"Update called with id={id}, dto.Id={dto.Id}, name={dto.Name}, wkt={dto.WKT}");
            dto.Id = id;
            var success = await _polygonService.UpdateAsync(dto);
            if (!success)
                return NotFound(new Response<string>(null!, "Güncellenecek kayıt bulunamadı veya geçersiz veri", false));

            return Ok(new Response<string>("Başarıyla güncellendi"));
        }
        /*
                   [HttpPut]
                   public async Task<IActionResult> Update(PolygonUpdateDto dto)
                   {
                       var success = await _polygonService.UpdateAsync(dto);
                       if (!success)
                           return NotFound(new Response<string>(null!, "Güncellenecek kayıt bulunamadı veya geçersiz veri", false));

                       return Ok(new Response<string>("Başarıyla güncellendi"));
                   }
                   */
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _polygonService.DeleteAsync(id);
            if (!success)
                return NotFound(new Response<string>(null!, "Silinecek kayıt bulunamadı", false));

            return Ok(new Response<string>("Başarıyla silindi"));
        }
    }
}
