document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const codigoDiv = document.getElementById('codigoResult');
  const codigoSpan = document.getElementById('codigo');
  const expiresSpan = document.getElementById('expires');
  const copyBtn = document.getElementById('copyBtn');
  const toastContainer = document.getElementById('toastContainer'); // debe existir en tu HTML

  // --- FUNCION PARA MOSTRAR TOASTS ---
  function showToast(message, type = 'info') {
    // Colores por tipo
    const bgClass =
      type === 'success' ? 'bg-success text-white' :
      type === 'danger' ? 'bg-danger text-white' :
      type === 'warning' ? 'bg-warning text-dark' :
      'bg-info text-white';

    // Crear estructura del toast
    const toast = document.createElement('div');
    toast.className = `toast align-items-center ${bgClass} border-0`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // Insertar en contenedor
    toastContainer.appendChild(toast);

    // Inicializar y mostrar
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    // Eliminar del DOM después de ocultarse
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  }

  // --- EVENTO DE LOGIN ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();

    try {
      const base = (window.API_BASE_URL || '').replace(/\/$/, '');
      if (!base) throw new Error('API_BASE_URL no definida.');

      const res = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_login: usuario, contrasena })
      });

      if (!res.ok) throw new Error('Usuario o contraseña incorrectos');

      const data = await res.json();
      showToast('Inicio de sesión exitoso.', 'success');

      // Mostrar el código recibido
      codigoSpan.textContent = data.codigo;
      expiresSpan.textContent = `Expira en: ${data.expiracion}`;
      codigoDiv.style.display = 'block';

      // Guardar el código en localStorage
      localStorage.setItem('codigoAcceso', data.codigo);
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });

  // --- COPIAR CODIGO AL PORTAPAPELES ---
  copyBtn.addEventListener('click', async () => {
    const codigo = codigoSpan.textContent.trim();
    if (!codigo) return;

    try {
      await navigator.clipboard.writeText(codigo);
      localStorage.setItem('codigoAcceso', codigo);
      showToast('Código copiado correctamente.', 'success');
    } catch (error) {
      showToast('Error al copiar el código.', 'danger');
    }
  });
});
