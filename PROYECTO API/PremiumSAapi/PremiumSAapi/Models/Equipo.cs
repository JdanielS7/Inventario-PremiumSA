using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PremiumSAapi.Models
{
    [Table("Equipos")]
    public class Equipo
    {
        [Key]
        [Column("id_equipo")]
        public int IdEquipo { get; set; }

        [Column("nombre_equipo")]
        public string NombreEquipo { get; set; } = string.Empty;

        [Column("marca")]
        public string? Marca { get; set; }

        [Column("modelo")]
        public string? Modelo { get; set; }

        [Column("numero_serie")]
        public string? NumeroSerie { get; set; }

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("id_categoria")]
        public int IdCategoria { get; set; }

        [Column("id_estado")]
        public int IdEstado { get; set; }

        [Column("id_bodega")]
        public int? IdBodega { get; set; }

        [Column("fecha_ingreso")]
        public DateTime FechaIngreso { get; set; }

        [Column("fecha_garantia")]
        public DateTime? FechaGarantia { get; set; }

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        // Navegación
        [ForeignKey("IdCategoria")]
        public virtual Categoria? Categoria { get; set; }
    }
}