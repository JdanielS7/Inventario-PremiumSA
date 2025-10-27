// login.js - maneja el envío del formulario de login y muestra el código recibido
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  const codigoDiv = document.getElementById('codigoResult');
  const codigoSpan = document.getElementById('codigo');
  const expiresSpan = document.getElementById('expires');

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
    // Redirige todas las notificaciones al sistema de burbujas flotantes
    showToast(message, type);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    if (!usuario || !contrasena) {
      showAlert('Completa usuario y contraseña.');
      return;
    }

    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_login: usuario, contrasena })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error en la petición' }));
        showAlert(err.message || 'Error en autenticación', 'danger');
        return;
      }

      const body = await res.json();
      if (body.success) {
        codigoSpan.textContent = body.codigo || '---';
        expiresSpan.textContent = body.expiresAt || '';
        codigoDiv.style.display = 'block';
        showAlert('Inicio de sesión correcto. Código generado.', 'success');
      } else {
        showAlert(body.message || 'Credenciales inválidas', 'danger');
      }

    } catch (err) {
      console.error(err);
      showAlert('No se pudo conectar al servidor.');
    }
  });
});
