// validate_move.js - valida un código y permite enviar movimientos
document.addEventListener('DOMContentLoaded', function() {
  const codeForm = document.getElementById('codeForm');
  const moveSection = document.getElementById('moveSection');
  const moveForm = document.getElementById('moveForm');
  const btnAddProduct = document.getElementById('btnAddProduct');
  const productsContainer = document.getElementById('productsContainer');
  let validatedCode = null;
  let categorias = [];
  let productos = [];
  const bodegaSelect = document.getElementById('idBodega');

  // Auto-paste from clipboard if it's a 6-digit code
  navigator.clipboard.readText().then(text => {
    if (/^\d{6}$/.test(text.trim())) {
      document.getElementById('authCode').value = text.trim();
    }
  }).catch(err => console.error('Clipboard read failed', err));

  // Focus the input
  document.getElementById('authCode').focus();
  

  // === Notificaciones flotantes personalizadas ===
  function showToast(message, type = 'danger') {
    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    toast.textContent = message;

    // Cambia color según tipo
    if (type === 'success') {
      toast.style.color = '#006400'; // verde oscuro
      toast.style.borderColor = '#006400';
    } else {
      toast.style.color = '#b30000'; // rojo
      toast.style.borderColor = '#b30000';
    }

    const alertPlaceholder = document.getElementById('alert-placeholder');
    alertPlaceholder.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function showAlert(message, type = 'danger', timeout = 4000) {
    showToast(message, type);
  }

  // === Validación de código ===
  codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('authCode').value.trim();
    if (!code) { showAlert('Introduce el código.'); return; }

    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/api/auth/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: code })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error al validar' }));
        showAlert(err.message || 'Código inválido');
        return;
      }

      if (!/^\d{6}$/.test(code)) {
        showAlert('El código debe tener 6 dígitos numéricos.');
        return;
      }

      const body = await res.json();
      if (body.valid) {
        validatedCode = code;
        moveSection.style.display = 'block';
        showAlert('Código válido. Ya puede registrar movimientos.', 'success');
      } else {
        const msg = body.message || 'Código no válido, usado o expirado.';
        showAlert(msg, 'danger');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de conexión con la API.');
    }
  });

  // === Envío de movimiento ===
  // Cargar categorías al iniciar
  async function cargarCategorias() {
    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/api/categorias`);
      if (!res.ok) throw new Error('Error al cargar categorías');
      categorias = await res.json();
    } catch (err) {
      console.error(err);
      showAlert('Error al cargar categorías');
    }
  }

  // Cargar productos por categoría con stock
  async function cargarProductos(idCategoria) {
    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/api/productos/categoria/${idCategoria}`);
      if (!res.ok) throw new Error('Error al cargar productos');
      return await res.json();
    } catch (err) {
      console.error(err);
      showAlert('Error al cargar productos');
      return [];
    }
  }

  // Verificar stock antes de permitir el movimiento
  async function verificarStock(idProducto, cantidad, tipoMovimiento) {
    if (!idProducto || !cantidad || !tipoMovimiento) {
      return { valido: true }; // No validar si falta algún dato
    }

    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/api/productos/${idProducto}/stock`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al verificar stock');
      }

      const data = await res.json();
      const stock_actual = data.stock_actual;
      const stock_minimo = data.stock_minimo;

      // Solo validar para movimientos que reducen stock
      if (['Retiro', 'Baja'].includes(tipoMovimiento)) {
        const stockFinal = stock_actual - cantidad;
        if (stockFinal < stock_minimo) { // Cambiado a < en lugar de <=
          return {
            valido: false,
            mensaje: `¡Advertencia! No se puede realizar el movimiento. El stock quedaría en ${stockFinal} unidades, que es menor al stock mínimo (${stock_minimo}).`
          };
        } else if (stockFinal === stock_minimo) {
          // Permitir llegar al stock mínimo pero mostrar advertencia
          showAlert(`Atención: El stock quedará en el mínimo permitido (${stock_minimo} unidades).`, 'warning');
          return { valido: true };
        }
      }
      return { valido: true };
    } catch (err) {
      console.error('Error al verificar stock:', err);
      showAlert(err.message || 'Error al verificar stock del producto');
      return { valido: false, mensaje: 'Error al verificar stock del producto' };
    }
  }

  // Crear una nueva fila de producto
  function crearFilaProducto() {
    const div = document.createElement('div');
    div.className = 'product-row mb-3';
    div.innerHTML = `
      <button type="button" class="btn-close" aria-label="Eliminar"></button>
      <div class="row g-3">
        <div class="col-md-5">
          <select class="form-select categoria-select" required>
            <option value="">Seleccione categoría...</option>
            ${categorias.map(c => `<option value="${c.id_categoria}">${c.nombre_categoria}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-5">
          <select class="form-select producto-select" required disabled>
            <option value="">Seleccione producto...</option>
          </select>
        </div>
        <div class="col-md-2">
          <input type="number" class="form-control cantidad-input" min="1" value="1" required>
        </div>
      </div>
    `;

    // Evento para eliminar la fila
    div.querySelector('.btn-close').addEventListener('click', () => div.remove());

    // Evento para cargar productos cuando se selecciona categoría
    const categoriaSelect = div.querySelector('.categoria-select');
    const productoSelect = div.querySelector('.producto-select');
    const cantidadInput = div.querySelector('.cantidad-input');
    
    categoriaSelect.addEventListener('change', async () => {
      productoSelect.disabled = true;
      productoSelect.innerHTML = '<option value="">Cargando...</option>';
      
      const productos = await cargarProductos(categoriaSelect.value);
      
      productoSelect.innerHTML = `
        <option value="">Seleccione producto...</option>
        ${productos.map(p => `<option value="${p.id_equipo}">${p.nombre_equipo}</option>`).join('')}
      `;
      productoSelect.disabled = false;
    });

    // Evento para verificar stock cuando se cambia la cantidad
    cantidadInput.addEventListener('change', async () => {
      const productoId = productoSelect.value;
      const cantidad = parseInt(cantidadInput.value, 10);
      const tipoMovimiento = document.getElementById('tipoMovimiento').value;
      
      if (productoId && cantidad > 0) {
        const validacion = await verificarStock(productoId, cantidad, tipoMovimiento);
        if (!validacion.valido) {
          showAlert(validacion.mensaje, 'warning');
          cantidadInput.value = '1'; // resetear a valor válido
        }
      }
    });

    // Validar también cuando se cambia el producto seleccionado
    productoSelect.addEventListener('change', async () => {
      if (cantidadInput.value > 1) {
        const validacion = await verificarStock(
          productoSelect.value, 
          parseInt(cantidadInput.value, 10),
          document.getElementById('tipoMovimiento').value
        );
        if (!validacion.valido) {
          showAlert(validacion.mensaje, 'warning');
          cantidadInput.value = '1';
        }
      }
    });

    productsContainer.appendChild(div);
  }

  // Inicialmente evitar añadir productos hasta seleccionar bodega
  btnAddProduct.disabled = true;

  // Habilitar botón de añadir productos sólo si se selecciona una bodega
  bodegaSelect.addEventListener('change', () => {
    const val = bodegaSelect.value;
    if (!val) {
      btnAddProduct.disabled = true;
      // limpiar filas de productos si quitan o cambian la bodega
      productsContainer.innerHTML = '';
    } else {
      btnAddProduct.disabled = false;
    }
  });

  // Evento del botón añadir producto (comprueba que exista bodega seleccionada)
  btnAddProduct.addEventListener('click', () => {
    if (!bodegaSelect.value) {
      showAlert('Debe seleccionar la bodega de origen antes de agregar productos.');
      return;
    }
    crearFilaProducto();
  });

  // Cargar bodegas al iniciar
  async function cargarBodegas() {
    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/api/bodegas`);
      if (!res.ok) throw new Error('Error al cargar bodegas');
      const bodegas = await res.json();
      
      const bodegaSelect = document.getElementById('idBodega');
      bodegaSelect.innerHTML = `
        <option value="">Seleccione una bodega</option>
        ${bodegas.map(b => `<option value="${b.idBodega}">${b.nombreBodega}</option>`).join('')}
      `;
    } catch (err) {
      console.error(err);
      showAlert('Error al cargar bodegas');
    }
  }

  // Al cargar el formulario, obtener las categorías y bodegas
  Promise.all([cargarCategorias(), cargarBodegas()]);

  moveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validatedCode) { showAlert('Valida primero el código.'); return; }

    const tipo = document.getElementById('tipoMovimiento').value;
    const idBodega = document.getElementById('idBodega').value || null;
    if (!idBodega) {
      showAlert('La bodega de origen es obligatoria. Seleccione una bodega.');
      return;
    }
    const observaciones = document.getElementById('observaciones').value.trim();

    // Recolectar productos de las filas
    const productos = [];
    const filas = productsContainer.querySelectorAll('.product-row');
    
    if (filas.length === 0) {
      showAlert('Agrega al menos un producto.');
      return;
    }

    filas.forEach(fila => {
      const producto = fila.querySelector('.producto-select').value;
      const cantidad = parseInt(fila.querySelector('.cantidad-input').value, 10);
      
      if (producto && cantidad > 0) {
        productos.push({
          id_equipo: parseInt(producto, 10),
          cantidad: cantidad
        });
      }
    });

    if (productos.length === 0) {
      showAlert('Asegúrate de completar todos los campos de productos.');
      return;
    }

    const payload = {
      codigo_autorizacion: validatedCode,
      tipo_movimiento: tipo,
      id_bodega: idBodega ? parseInt(idBodega, 10) : null,
      productos,
      observaciones
    };

    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/api/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error en registro' }));
        showAlert(err.message || 'No se pudo registrar movimiento.');
        return;
      }

      const body = await res.json();
      if (body.success) {
        showAlert('Movimiento registrado correctamente.', 'success');
        moveForm.reset();
        moveSection.style.display = 'none';
        validatedCode = null;
      } else {
        showAlert(body.message || 'Error al registrar movimiento.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de conexión al enviar movimiento.');
    }
  });
});
