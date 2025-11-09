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

        [Column("ubicacion")]
        public string? Ubicacion { get; set; }
    }
}