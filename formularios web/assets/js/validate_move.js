// validate_move.js - valida un código y permite enviar movimientos
document.addEventListener('DOMContentLoaded', function() {
  const codeForm = document.getElementById('codeForm');
  const moveSection = document.getElementById('moveSection');
  const moveForm = document.getElementById('moveForm');
  let validatedCode = null;

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
  moveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validatedCode) { showAlert('Valida primero el código.'); return; }

    const tipo = document.getElementById('tipoMovimiento').value;
    const idBodega = document.getElementById('idBodega').value || null;
    const productosRaw = document.getElementById('productos').value.trim();
    const observaciones = document.getElementById('observaciones').value.trim();

    if (!productosRaw) { showAlert('Ingresa al menos un producto.'); return; }

    const productos = productosRaw.split('\n').map(line => {
      const parts = line.split(',').map(p => p.trim());
      return { id_equipo: parseInt(parts[0], 10), cantidad: parseInt(parts[1] || '1', 10) };
    }).filter(p => Number.isInteger(p.id_equipo) && Number.isInteger(p.cantidad));

    if (productos.length === 0) { showAlert('Formato de productos inválido.'); return; }

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
