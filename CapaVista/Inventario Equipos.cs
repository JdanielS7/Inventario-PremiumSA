using CapaControlador;
using System;
using System.Data;
using System.Windows.Forms;

namespace CapaVista
{
    public partial class Inventario_Equipos : Form
    {
        private string nombreUsuario;
        CapaControlador.controlador capaControlador_inventario = new CapaControlador.controlador();

        public Inventario_Equipos(string nombreUsuario)
        {
            InitializeComponent();
            this.nombreUsuario = nombreUsuario;
            InicializarFormulario();
        }

        private void InicializarFormulario()
        {
            // Cargar categorías en ComboBox
            cmb_idEquipo.DataSource = capaControlador_inventario.obtenerCategorias();
            cmb_idEquipo.ValueMember = "id_categoria";
            cmb_idEquipo.DisplayMember = "nombre_categoria";
            cmb_idEquipo.SelectedIndex = -1;

            // Cargar equipos: ahora se mostrará el NOMBRE del equipo, pero se usará el ID como valor interno
            cmb_Id.DataSource = capaControlador_inventario.obtenerEquiposID();
            cmb_Id.ValueMember = "id_equipo";        // el valor real que se guarda
            cmb_Id.DisplayMember = "nombre_equipo";  // lo que ve el usuario
            cmb_Id.SelectedIndex = -1;

            // Cargar inventario
            CargarInventario();
        }

        private void CargarInventario()
        {
            DataTable dt = capaControlador_inventario.obtenerInventario();
            dgv_inventario.DataSource = dt;

            // Cambiar encabezados visibles
            if (dgv_inventario.Columns.Contains("nombre_categoria"))
                dgv_inventario.Columns["nombre_categoria"].HeaderText = "Categoría";

            if (dgv_inventario.Columns.Contains("nombre_equipo"))
                dgv_inventario.Columns["nombre_equipo"].HeaderText = "Equipo";

            // Ocultar las columnas ID que no deseas mostrar
            if (dgv_inventario.Columns.Contains("id_categoria"))
                dgv_inventario.Columns["id_categoria"].Visible = false;

            if (dgv_inventario.Columns.Contains("id_equipo"))
                dgv_inventario.Columns["id_equipo"].Visible = false;

            dgv_inventario.AutoResizeColumns();
        }

        private void LimpiarCampos()
        {
            txt_codigoInventario.Clear();
            cmb_idEquipo.SelectedIndex = -1;
            cmb_Id.SelectedIndex = -1;
            txtStockActual.Clear();
            txtStockMinimo.Clear();
        }

        private void btn_ayudaequipo_Click(object sender, EventArgs e)
        {

        }

        private void salir_equipo_Click_1(object sender, EventArgs e)
        {
            this.Hide();
            Menu menu = new Menu(nombreUsuario);
            menu.ShowDialog();
            this.Close();
        }



        private void btn_actualizarequipo_Click(object sender, EventArgs e)
        {
            CargarInventario();
        }


        private void dgv_inventario_CellClick_1(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow fila = dgv_inventario.Rows[e.RowIndex];

                txt_codigoInventario.Text = fila.Cells["id_inventario"].Value?.ToString();
                txtStockActual.Text = fila.Cells["stock_actual"].Value?.ToString();
                txtStockMinimo.Text = fila.Cells["stock_minimo"].Value?.ToString();

                // Seleccionar categoría
                if (fila.Cells["nombre_categoria"].Value != DBNull.Value)
                {
                    cmb_idEquipo.Text = fila.Cells["nombre_categoria"].Value.ToString();
                }

                // Seleccionar equipo por nombre
                if (fila.Cells["nombre_equipo"].Value != DBNull.Value)
                {
                    cmb_Id.Text = fila.Cells["nombre_equipo"].Value.ToString();
                }
                else
                {
                    cmb_Id.SelectedIndex = -1;
                }
            }
        }

        private void btn_modregistroequipo_Click(object sender, EventArgs e)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(txt_codigoInventario.Text))
                {
                    MessageBox.Show("Selecciona un registro para modificar.");
                    return;
                }

                int idInventario = Convert.ToInt32(txt_codigoInventario.Text);
                int stockMinimo = Convert.ToInt32(txtStockMinimo.Text);
                int stockActual = Convert.ToInt32(txtStockActual.Text);

                capaControlador_inventario.editarInventario(idInventario, stockMinimo, stockActual);

                MessageBox.Show("Inventario modificado correctamente.", "Éxito", MessageBoxButtons.OK, MessageBoxIcon.Information);
                CargarInventario();
                LimpiarCampos();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error al modificar inventario: " + ex.Message);
            }
        }

        private void btn_actualizarInventario_Click(object sender, EventArgs e)
        {
            CargarInventario();
            MessageBox.Show("Tabla actualizada con los últimos registros.");
        }

        private void btn_eliminarequipo_Click(object sender, EventArgs e)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(txt_codigoInventario.Text))
                {
                    MessageBox.Show("Selecciona un registro para eliminar.");
                    return;
                }

                int idInventario = Convert.ToInt32(txt_codigoInventario.Text);
                DialogResult confirm = MessageBox.Show("¿Seguro que deseas eliminar este registro?", "Confirmar eliminación", MessageBoxButtons.YesNo);

                if (confirm == DialogResult.Yes)
                {
                    capaControlador_inventario.eliminarInventario(idInventario);
                    CargarInventario();
                    LimpiarCampos();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error al eliminar inventario: " + ex.Message);
            }
        }

        private void salir_equipo_Click(object sender, EventArgs e)
        {
            this.Hide();
            Menu menu = new Menu(nombreUsuario);
            menu.ShowDialog();
            this.Close();
        }
    }
}
