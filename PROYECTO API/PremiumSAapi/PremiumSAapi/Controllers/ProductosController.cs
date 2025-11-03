using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PremiumSAapi.Data;
using PremiumSAapi.Models;

namespace PremiumSAapi.Controllers
{
    [ApiController]
    [Route("api/productos")]
    public class ProductosController : ControllerBase
    {
        private readonly InventarioContext _db;

        public ProductosController(InventarioContext db)
        {
            _db = db;
        }

        [HttpGet("{idEquipo}/stock")]
        public async Task<IActionResult> GetStock(int idEquipo)
        {
            try
            {
                var result = await _db.Database
                    .SqlQuery<StockInfo>($"SELECT stock_actual as StockActual, stock_minimo as StockMinimo FROM Inventario_Equipos WHERE id_equipo = {idEquipo}")
                    .FirstOrDefaultAsync();

                if (result == null)
                {
                    return NotFound(new { message = "Producto no encontrado en inventario" });
                }

                return Ok(new
                {
                    stock_actual = result.StockActual,
                    stock_minimo = result.StockMinimo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener stock", error = ex.Message });
            }
        }

        [HttpGet("categoria/{idCategoria}")]
        public async Task<IActionResult> GetProductosPorCategoria(int idCategoria)
        {
            try
            {
                var productos = await _db.Equipos
                    .Where(e => e.IdCategoria == idCategoria)
                    .Select(e => new
                    {
                        id_equipo = e.IdEquipo,
                        nombre_equipo = e.NombreEquipo,
                        marca = e.Marca,
                        modelo = e.Modelo
                    })
                    .ToListAsync();

                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener productos", error = ex.Message });
            }
        }
    }
}