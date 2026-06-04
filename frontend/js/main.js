// ==================== CONFIGURACIÓN GLOBAL ====================

const API = '/api';
const token = localStorage.getItem('token');

// Verificar autenticación
if (!token) {
  window.location.href = 'login.html';
}

let usuarioId = '';
let usuarioRol = '';

// Decodificar token
function decodificarToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error decodificando token:', error);
    logout();
    return null;
  }
}

const usuarioDatos = decodificarToken(token);
usuarioId = usuarioDatos?.id;
usuarioRol = usuarioDatos?.rol || 'user';

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
  inicializarDashboard();
  cargarServicios();
  cargarMisReservas();
  configurarEventos();
});

// ==================== INICIALIZACIÓN DEL DASHBOARD ====================

function inicializarDashboard() {
  // Actualizar UI según rol
  const adminSection = document.getElementById('adminServiciosSection');
  if (adminSection && usuarioRol === 'admin') {
    adminSection.style.display = 'block';
  }

  // Mostrar/ocultar secciones de reservas según rol
  const seccionMisReservas = document.getElementById('seccionMisReservas');
  const seccionTodasReservas = document.getElementById('seccionTodasReservas');
  const btnNuevaReserva = document.getElementById('btnNuevaReserva');

  if (usuarioRol === 'admin') {
    if (seccionMisReservas) seccionMisReservas.style.display = 'none';
    if (seccionTodasReservas) seccionTodasReservas.style.display = 'block';
    if (btnNuevaReserva) btnNuevaReserva.style.display = 'none';
  } else {
    if (seccionMisReservas) seccionMisReservas.style.display = 'block';
    if (seccionTodasReservas) seccionTodasReservas.style.display = 'none';
    if (btnNuevaReserva) btnNuevaReserva.style.display = 'block';
  }

  // Mostrar rol del usuario
  const rolElement = document.getElementById('usuarioRol');
  if (rolElement) {
    if (usuarioRol === 'admin') {
      rolElement.textContent = 'Administrador';
      rolElement.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    } else {
      rolElement.textContent = 'Usuario';
    }
  }
}

// ==================== SERVICIOS ====================

async function cargarServicios() {
  try {
    const response = await fetch(`${API}/servicios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar servicios');

    const servicios = await response.json();
    mostrarServicios(servicios);
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error al cargar los servicios');
  }
}

function mostrarServicios(servicios) {
  // Mostrar servicios en la sección de vista general
  const containerView = document.getElementById('serviciosListViewOnly');
  if (containerView) {
    if (servicios.length === 0) {
      containerView.innerHTML = '<p class="sin-datos">No hay servicios disponibles</p>';
    } else {
      containerView.innerHTML = servicios
        .map(
          (servicio) => `
        <div class="servicio-card">
          <h3>${servicio.nombre}</h3>
          <p>${servicio.descripcion || 'Sin descripción'}</p>
          <button onclick="abrirReserva(${servicio.id}, '${servicio.nombre}')">
            Reservar
          </button>
        </div>
      `
        )
        .join('');
    }
  }

  // Mostrar servicios en la sección admin (con CRUD completo por tarjeta)
  if (usuarioRol === 'admin') {
    const containerAdmin = document.getElementById('serviciosList');
    if (containerAdmin) {
      if (servicios.length === 0) {
        containerAdmin.innerHTML = '<p class="sin-datos">No hay servicios registrados</p>';
      } else {
        containerAdmin.innerHTML = servicios
          .map((servicio) => {
            const nombreEsc = String(servicio.nombre || '').replace(/"/g, '&quot;');
            const descEsc = String(servicio.descripcion || '').replace(/"/g, '&quot;');
            return `
            <div class="servicio-card" id="card-${servicio.id}" data-nombre="${nombreEsc}" data-desc="${descEsc}">
              <div id="view-${servicio.id}">
                <h3>${servicio.nombre}</h3>
                <p>${servicio.descripcion || 'Sin descripción'}</p>
                <div style="display:flex; gap:8px; margin-top:10px;">
                  <button onclick="editarServicio(${servicio.id})" style="flex:1;">✏️ Editar</button>
                  <button class="btn-danger" onclick="eliminarServicio(${servicio.id})" style="flex:1;">🗑️ Eliminar</button>
                </div>
              </div>
              <div id="edit-${servicio.id}" style="display:none;">
                <div class="form-group" style="margin-bottom:10px;">
                  <label style="color:#bdc3c7; font-size:12px;">Nombre</label>
                  <input type="text" id="edit-nombre-${servicio.id}" style="width:100%; padding:8px; background:#2d2d2d; border:1px solid #27ae60; color:#ecf0f1; border-radius:4px; box-sizing:border-box;" />
                </div>
                <div class="form-group" style="margin-bottom:10px;">
                  <label style="color:#bdc3c7; font-size:12px;">Descripción</label>
                  <input type="text" id="edit-desc-${servicio.id}" style="width:100%; padding:8px; background:#2d2d2d; border:1px solid #27ae60; color:#ecf0f1; border-radius:4px; box-sizing:border-box;" />
                </div>
                <div style="display:flex; gap:8px;">
                  <button onclick="guardarServicio(${servicio.id})" style="flex:1;">✅ Guardar</button>
                  <button onclick="cancelarEdicion(${servicio.id})" style="flex:1; background:linear-gradient(135deg,#7f8c8d,#95a5a6);">✕ Cancelar</button>
                </div>
              </div>
            </div>
          `;
          })
          .join('');
      }
    }
  }
}

async function eliminarServicio(servicioId) {
  if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;

  try {
    const response = await fetch(`${API}/servicios/${servicioId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const resultado = await response.json();
    if (response.ok) {
      mostrarAlertaDashboard('success', 'Servicio eliminado correctamente');
      cargarServicios();
    } else {
      mostrarAlertaDashboard('danger', resultado.mensaje || 'Error al eliminar el servicio');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error de conexión');
  }
}

function editarServicio(id) {
  const card = document.getElementById(`card-${id}`);
  document.getElementById(`edit-nombre-${id}`).value = card.dataset.nombre;
  document.getElementById(`edit-desc-${id}`).value = card.dataset.desc;
  document.getElementById(`view-${id}`).style.display = 'none';
  document.getElementById(`edit-${id}`).style.display = 'block';
}

function cancelarEdicion(id) {
  document.getElementById(`view-${id}`).style.display = 'block';
  document.getElementById(`edit-${id}`).style.display = 'none';
}

async function guardarServicio(id) {
  const nombre = document.getElementById(`edit-nombre-${id}`).value.trim();
  const descripcion = document.getElementById(`edit-desc-${id}`).value.trim();

  if (!nombre) {
    mostrarAlertaDashboard('danger', 'El nombre es obligatorio');
    return;
  }

  try {
    const response = await fetch(`${API}/servicios/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, descripcion }),
    });

    const resultado = await response.json();

    if (response.ok) {
      mostrarAlertaDashboard('success', 'Servicio actualizado correctamente');
      cargarServicios();
    } else {
      mostrarAlertaDashboard('danger', resultado.mensaje || 'Error al actualizar el servicio');
    }
  } catch (error) {
    mostrarAlertaDashboard('danger', 'Error de conexión');
  }
}

// ==================== RESERVAS ====================

async function cargarMisReservas() {
  // Si es admin, cargar todas las reservas
  if (usuarioRol === 'admin') {
    cargarTodasReservas();
    return;
  }

  try {
    const response = await fetch(`${API}/reservas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar reservas');

    const reservas = await response.json();
    mostrarReservas(reservas);
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error al cargar tus reservas');
  }
}

async function cargarTodasReservas() {
  try {
    const response = await fetch(`${API}/reservas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al cargar reservas');

    const reservas = await response.json();
    mostrarTodasReservas(reservas);
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error al cargar las reservas');
  }
}

function mostrarReservas(reservas) {
  const container = document.getElementById('reservasList');
  if (!container) return;

  if (reservas.length === 0) {
    container.innerHTML = '<p class="sin-datos">No hay reservas aún</p>';
    return;
  }

  container.innerHTML = reservas
    .map(
      (reserva) => `
    <div class="reserva-card">
      <h4>${reserva.servicio_nombre || 'Servicio'}</h4>
      <p><strong>${reserva.fecha}</strong> a las <strong>${reserva.hora}</strong></p>
      <button class="btn-danger" onclick="eliminarReserva(${reserva.id})">
        Cancelar
      </button>
    </div>
  `
    )
    .join('');
}

function mostrarTodasReservas(reservas) {
  const container = document.getElementById('todasReservasList');
  if (!container) return;

  if (reservas.length === 0) {
    container.innerHTML = '<p class="sin-datos">No hay reservas registradas</p>';
    return;
  }

  // Agrupar reservas por usuario
  const reservasPorUsuario = {};
  reservas.forEach((reserva) => {
    if (!reservasPorUsuario[reserva.usuario_nombre]) {
      reservasPorUsuario[reserva.usuario_nombre] = [];
    }
    reservasPorUsuario[reserva.usuario_nombre].push(reserva);
  });

  // Renderizar reservas agrupadas por usuario
  let html = '';
  for (const [nombreUsuario, reservasUsuario] of Object.entries(reservasPorUsuario)) {
    html += `
      <div class="usuario-reservas-section" style="margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
        <h4 style="color: #2ecc71; margin-bottom: 15px; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;">
          👤 ${nombreUsuario}
        </h4>
        <div style="display: grid; gap: 10px;">
    `;

    reservasUsuario.forEach((reserva) => {
      html += `
        <div class="reserva-card-admin" style="background: #f9f9f9; padding: 12px; border-left: 4px solid #2ecc71; border-radius: 4px; color: #333;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div>
              <small style="color: #666;">Servicio</small>
              <p style="margin: 0; font-weight: bold;">${reserva.servicio_nombre || 'N/A'}</p>
            </div>
            <div>
              <small style="color: #666;">Fecha</small>
              <p style="margin: 0; font-weight: bold;">${reserva.fecha || 'N/A'}</p>
            </div>
            <div>
              <small style="color: #666;">Hora</small>
              <p style="margin: 0; font-weight: bold;">${reserva.hora || 'N/A'}</p>
            </div>
          </div>
          <button class="btn-danger" onclick="eliminarReservaAdmin(${reserva.id})" style="width: 100%;">
            🗑️ Eliminar Reserva
          </button>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function fechaHoyLocal() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function horaActualLocal() {
  const ahora = new Date();
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mi = String(ahora.getMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
}

function actualizarMinHora(fechaInput, horaInput) {
  if (!fechaInput || !horaInput) return;
  if (fechaInput.value === fechaHoyLocal()) {
    horaInput.min = horaActualLocal();
    if (horaInput.value && horaInput.value < horaInput.min) horaInput.value = '';
  } else {
    horaInput.min = '';
  }
}

function abrirReserva(servicioId, servicioNombre) {
  const modal = document.getElementById('modalReserva');
  if (!modal) return;

  const fechaInput = document.getElementById('reservaFecha');
  const horaInput = document.getElementById('reservaHora');
  const servicioInput = document.getElementById('servicioIdInput');

  if (fechaInput) {
    fechaInput.value = '';
    fechaInput.min = fechaHoyLocal();
    fechaInput.onchange = () => actualizarMinHora(fechaInput, horaInput);
  }
  if (horaInput) {
    horaInput.value = '';
    horaInput.min = '';
  }
  if (servicioInput) servicioInput.value = servicioId;

  const titulo = document.querySelector('#modalReserva h2');
  if (titulo) titulo.textContent = `Reservar: ${servicioNombre}`;

  modal.style.display = 'block';
}

async function crearReserva() {
  const fecha = document.getElementById('reservaFecha')?.value;
  const hora = document.getElementById('reservaHora')?.value;
  const servicioId = document.getElementById('servicioIdInput')?.value;

  if (!fecha || !hora) {
    mostrarAlertaDashboard('danger', 'Por favor completa todos los campos');
    return;
  }

  try {
    const response = await fetch(`${API}/reservas`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        servicioId: parseInt(servicioId),
        fecha,
        hora,
      }),
    });

    const resultado = await response.json();

    if (response.ok) {
      mostrarAlertaDashboard('success', 'Reserva creada exitosamente');
      cerrarModal('modalReserva');
      cargarMisReservas();
    } else {
      mostrarAlertaDashboard('danger', resultado.mensaje || 'Error al crear la reserva');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error de conexión');
  }
}

async function eliminarReserva(reservaId) {
  if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;

  try {
    const response = await fetch(`${API}/reservas/${reservaId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      mostrarAlertaDashboard('success', 'Reserva cancelada correctamente');
      cargarMisReservas();
    } else {
      mostrarAlertaDashboard('danger', 'Error al cancelar la reserva');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error de conexión');
  }
}

async function eliminarReservaAdmin(reservaId) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta reserva?')) return;

  try {
    const response = await fetch(`${API}/reservas/${reservaId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      mostrarAlertaDashboard('success', 'Reserva eliminada correctamente');
      cargarTodasReservas();
    } else {
      mostrarAlertaDashboard('danger', 'Error al eliminar la reserva');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error de conexión');
  }
}

// ==================== SERVICIOS (ADMIN) ====================

async function crearServicio() {
  const nombre = document.getElementById('nuevoServicioNombre')?.value;
  const descripcion = document.getElementById('nuevoServicioDesc')?.value;

  if (!nombre) {
    mostrarAlertaDashboard('danger', 'El nombre del servicio es obligatorio');
    return;
  }

  try {
    const response = await fetch(`${API}/servicios`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, descripcion }),
    });

    const resultado = await response.json();

    if (response.ok) {
      mostrarAlertaDashboard('success', 'Servicio creado exitosamente');
      if (document.getElementById('nuevoServicioNombre')) {
        document.getElementById('nuevoServicioNombre').value = '';
      }
      if (document.getElementById('nuevoServicioDesc')) {
        document.getElementById('nuevoServicioDesc').value = '';
      }
      cargarServicios();
    } else {
      mostrarAlertaDashboard('danger', resultado.mensaje || 'Error al crear el servicio');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlertaDashboard('danger', 'Error de conexión');
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

function mostrarAlertaDashboard(tipo, mensaje) {
  const container = document.getElementById('alertContainer');
  if (!container) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${tipo} show`;
  alert.innerHTML = `
    <strong>${tipo === 'success' ? '✓' : '✕'}</strong> ${mensaje}
  `;

  container.innerHTML = '';
  container.appendChild(alert);

  if (tipo === 'success') {
    setTimeout(() => alert.remove(), 3000);
  }
}

function abrirModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'block';
}

function cerrarModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

// ==================== CONFIGURACIÓN DE EVENTOS ====================

function configurarEventos() {
  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Botón de logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', logout);
  }
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
  inicializarDashboard();
  cargarServicios();
  cargarMisReservas();
  configurarEventos();
});
