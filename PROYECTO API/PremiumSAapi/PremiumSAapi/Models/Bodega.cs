using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PremiumSAapi.Models
{
    [Table("Bodegas")]
    public class Bodega
    {
        [Key]
        [Column("id_bodega")]
        public int IdBodega { get; set; }

        [Column("nombre_bodega")]
        public string NombreBodega { get; set; } = string.Empty;

        [Column("ubicacion_bodega")]
        public string? UbicacionBodega { get; set; }

        [Column("capacidad_bodega")]
        public double? CapacidadBodega { get; set; }
    }
}
