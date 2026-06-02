// ==================== LÓGICA DE LOGIN ====================

const form = document.getElementById('formLogin');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnSubmit = document.getElementById('btnSubmit');

// ==================== VALIDACIÓN EN TIEMPO REAL ====================

emailInput.addEventListener('blur', () => {
  const errors = validarEmail(emailInput.value);
  
  if (errors.length > 0) {
    emailInput.classList.add('error');
    emailInput.classList.remove('success');
    mostrarError('emailError', errors[0]);
  } else {
    emailInput.classList.remove('error');
    emailInput.classList.add('success');
    mostrarError('emailError', '');
  }
  actualizarEstadoBoton();
});

passwordInput.addEventListener('blur', () => {
  const errors = validarPassword(passwordInput.value);
  
  if (errors.length > 0) {
    passwordInput.classList.add('error');
    passwordInput.classList.remove('success');
    mostrarError('passwordError', errors[0]);
  } else {
    passwordInput.classList.remove('error');
    passwordInput.classList.add('success');
    mostrarError('passwordError', '');
  }
  actualizarEstadoBoton();
});

// Limpiar errores mientras se escribe
emailInput.addEventListener('input', () => {
  if (emailInput.classList.contains('error')) {
    mostrarError('emailError', '');
  }
});

passwordInput.addEventListener('input', () => {
  if (passwordInput.classList.contains('error')) {
    mostrarError('passwordError', '');
  }
});

// ==================== VALIDACIÓN DEL FORMULARIO ====================

function validarFormulario() {
  limpiarErrores(['emailError', 'passwordError']);
  const errores = {};

  // Validar email
  const erroresEmail = validarEmail(emailInput.value);
  if (erroresEmail.length > 0) {
    errores.email = erroresEmail[0];
    emailInput.classList.add('error');
  } else {
    emailInput.classList.remove('error');
  }

  // Validar contraseña
  const erroresPassword = validarPassword(passwordInput.value);
  if (erroresPassword.length > 0) {
    errores.password = erroresPassword[0];
    passwordInput.classList.add('error');
  } else {
    passwordInput.classList.remove('error');
  }

  return errores;
}

function actualizarEstadoBoton() {
  const emailValido = emailInput.value && !validarEmail(emailInput.value).length;
  const passwordValido = passwordInput.value && !validarPassword(passwordInput.value).length;
  
  btnSubmit.disabled = !(emailValido && passwordValido);
}

// ==================== ENVÍO DEL FORMULARIO ====================

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validar antes de enviar
  const errores = validarFormulario();
  if (Object.keys(errores).length > 0) {
    mostrarAlerta('danger', 'Por favor, verifica los errores en el formulario');
    return;
  }

  // Mostrar loader
  mostrarLoader('btnSubmit', true);

  const datos = {
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  try {
    const response = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    const resultado = await response.json();

    if (response.ok) {
      // Guardar token
      localStorage.setItem('token', resultado.token);
      localStorage.setItem('usuario', JSON.stringify(resultado.usuario || { email: datos.email }));
      
      mostrarAlerta('success', 'Bienvenido! Redirigiendo...');
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      mostrarAlerta('danger', resultado.mensaje || 'Error al iniciar sesión. Verifica tus credenciales.');
      mostrarLoader('btnSubmit', false);
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlerta('danger', 'Error de conexión. Por favor, intenta de nuevo más tarde.');
    mostrarLoader('btnSubmit', false);
  }
});

// Inicializar estado del botón
actualizarEstadoBoton();

// ==================== TEMA OSCURO (OPCIONAL) ====================

document.addEventListener('DOMContentLoaded', () => {
  // Restaurar tema guardado
  const temaGuardado = localStorage.getItem('tema');
  if (temaGuardado === 'oscuro') {
    document.body.classList.add('dark-theme');
  }
});
