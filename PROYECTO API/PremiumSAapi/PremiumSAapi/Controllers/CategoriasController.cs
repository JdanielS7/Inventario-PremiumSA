using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PremiumSAapi.Data;
using PremiumSAapi.Models;

namespace PremiumSAapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly InventarioContext _db;

        public CategoriasController(InventarioContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategorias()
        {
            try
            {
                var categorias = await _db.Categorias
                    .Select(c => new
                    {
                        id_categoria = c.IdCategoria,
                        nombre_categoria = c.NombreCategoria
                    })
                    .ToListAsync();

                return Ok(categorias);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener categorías", error = ex.Message });
            }
        }
    }
}