// ==================== LÓGICA DE REGISTRO ====================

const form = document.getElementById('formRegistro');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const rolInput = document.getElementById('rol');
const btnSubmit = document.getElementById('btnSubmit');

// ==================== VALIDACIÓN DEL NOMBRE EN TIEMPO REAL ====================

nombreInput.addEventListener('input', () => {
  const errors = validarNombre(nombreInput.value);
  
  if (nombreInput.value.trim() === '') {
    nombreInput.classList.remove('error', 'success');
    mostrarError('nombreError', '');
    mostrarExito('nombreSuccess', '');
  } else if (errors.length > 0) {
    nombreInput.classList.add('error');
    nombreInput.classList.remove('success');
    mostrarError('nombreError', errors[0]);
    mostrarExito('nombreSuccess', '');
  } else {
    nombreInput.classList.remove('error');
    nombreInput.classList.add('success');
    mostrarError('nombreError', '');
    mostrarExito('nombreSuccess', '✓ Nombre válido');
  }
  
  actualizarEstadoBoton();
});

// ==================== VALIDACIÓN DEL EMAIL EN TIEMPO REAL ====================

emailInput.addEventListener('input', () => {
  const errors = validarEmail(emailInput.value);
  
  if (emailInput.value.trim() === '') {
    emailInput.classList.remove('error', 'success');
    mostrarError('emailError', '');
    mostrarExito('emailSuccess', '');
  } else if (errors.length > 0) {
    emailInput.classList.add('error');
    emailInput.classList.remove('success');
    mostrarError('emailError', errors[0]);
    mostrarExito('emailSuccess', '');
  } else {
    emailInput.classList.remove('error');
    emailInput.classList.add('success');
    mostrarError('emailError', '');
    mostrarExito('emailSuccess', '✓ Email válido');
  }
  
  actualizarEstadoBoton();
});

// ==================== VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL ====================

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  
  // Mostrar/ocultar requisitos
  if (password.length > 0) {
    document.getElementById('passwordRequirements').classList.add('show');
    document.getElementById('passwordStrength').classList.add('show');
  } else {
    document.getElementById('passwordRequirements').classList.remove('show');
    document.getElementById('passwordStrength').classList.remove('show');
  }

  // Actualizar requisitos
  const requirements = actualizarRequiremientosPassword(password);
  actualizarVisualesRequiremientos(requirements);

  // Actualizar barra de fortaleza
  const fortaleza = evaluarFortalezaPassword(password);
  const strengthBar = document.getElementById('strengthBar');
  strengthBar.className = `password-strength-bar ${fortaleza.nivel}`;

  // Validar errores
  const errors = validarPassword(password);
  
  if (errors.length > 0) {
    passwordInput.classList.add('error');
    passwordInput.classList.remove('success');
    mostrarError('passwordError', errors[0]);
  } else {
    passwordInput.classList.remove('error');
    passwordInput.classList.add('success');
    mostrarError('passwordError', '');
  }

  // Validar coincidencia con confirmación
  if (confirmPasswordInput.value) {
    validarConfirmacionPassword();
  }
  
  actualizarEstadoBoton();
});

// ==================== VALIDACIÓN DE CONFIRMACIÓN DE CONTRASEÑA ====================

function validarConfirmacionPassword() {
  if (confirmPasswordInput.value === '') {
    confirmPasswordInput.classList.remove('error', 'success');
    mostrarError('confirmPasswordError', '');
    mostrarExito('confirmPasswordSuccess', '');
    return;
  }

  const errors = validarConfirmPassword(passwordInput.value, confirmPasswordInput.value);
  
  if (errors.length > 0) {
    confirmPasswordInput.classList.add('error');
    confirmPasswordInput.classList.remove('success');
    mostrarError('confirmPasswordError', errors[0]);
    mostrarExito('confirmPasswordSuccess', '');
  } else {
    confirmPasswordInput.classList.remove('error');
    confirmPasswordInput.classList.add('success');
    mostrarError('confirmPasswordError', '');
    mostrarExito('confirmPasswordSuccess', '✓ Las contraseñas coinciden');
  }
  
  actualizarEstadoBoton();
}

confirmPasswordInput.addEventListener('input', validarConfirmacionPassword);

// Validación del rol
rolInput.addEventListener('change', () => {
  actualizarEstadoBoton();
});

// ==================== VALIDACIÓN DEL FORMULARIO ====================

function validarFormulario() {
  limpiarErrores(['nombreError', 'emailError', 'passwordError', 'confirmPasswordError']);
  const errores = {};

  // Validar nombre
  const erroresNombre = validarNombre(nombreInput.value);
  if (erroresNombre.length > 0) {
    errores.nombre = erroresNombre[0];
    nombreInput.classList.add('error');
  } else {
    nombreInput.classList.remove('error');
  }

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

  // Validar confirmación de contraseña
  const erroresConfirm = validarConfirmPassword(passwordInput.value, confirmPasswordInput.value);
  if (erroresConfirm.length > 0) {
    errores.confirmPassword = erroresConfirm[0];
    confirmPasswordInput.classList.add('error');
  } else {
    confirmPasswordInput.classList.remove('error');
  }

  return errores;
}

function actualizarEstadoBoton() {
  const nombreValido = nombreInput.value && !validarNombre(nombreInput.value).length;
  const emailValido = emailInput.value && !validarEmail(emailInput.value).length;
  const passwordValido = passwordInput.value && !validarPassword(passwordInput.value).length;
  const confirmValido = confirmPasswordInput.value && !validarConfirmPassword(passwordInput.value, confirmPasswordInput.value).length;
  const rolValido = rolInput.value && rolInput.value.length > 0;
  
  btnSubmit.disabled = !(nombreValido && emailValido && passwordValido && confirmValido && rolValido);
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
    nombre: nombreInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    rol: rolInput.value
  };

  try {
    const response = await fetch('http://localhost:3000/api/usuarios/registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    const resultado = await response.json();

    if (response.ok) {
      mostrarAlerta('success', 'Registro exitoso! Redirigiendo al login...');
      
      // Limpiar formulario
      form.reset();
      document.getElementById('passwordRequirements').classList.remove('show');
      document.getElementById('passwordStrength').classList.remove('show');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      mostrarAlerta('danger', resultado.mensaje || 'Error al registrar. Intenta nuevamente.');
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

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
  // Cualquier inicialización adicional aquí
});
