// ==================== REGLAS DE NEGOCIO Y VALIDACIONES ====================

const VALIDACIONES = {
  // Nombre: 3-50 caracteres, solo letras y espacios
  nombre: {
    minLength: 3,
    maxLength: 50,
    regex: /^[a-záéíóúàèìòùäëïöüA-ZÁÉÍÓÚÀÈÌÒÙÄËÏÖ\s]+$/,
    mensajes: {
      vacio: 'El nombre es obligatorio',
      corto: 'El nombre debe tener al menos 3 caracteres',
      largo: 'El nombre no debe exceder 50 caracteres',
      invalido: 'El nombre solo debe contener letras y espacios'
    }
  },

  // Email: formato válido
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    mensajes: {
      vacio: 'El correo electrónico es obligatorio',
      invalido: 'Ingresa un correo electrónico válido'
    }
  },

  // Contraseña: mínimo 8 caracteres, mayúsculas, minúsculas, números, especiales
  password: {
    minLength: 8,
    maxLength: 128,
    mensajes: {
      vacio: 'La contraseña es obligatoria',
      corta: 'La contraseña debe tener al menos 8 caracteres',
      larga: 'La contraseña no debe exceder 128 caracteres',
      noMayuscula: 'Debe contener al menos una mayúscula (A-Z)',
      noMinuscula: 'Debe contener al menos una minúscula (a-z)',
      noNumero: 'Debe contener al menos un número (0-9)',
      noEspecial: 'Debe contener al menos un carácter especial (!@#$%^&*)',
      noCoinciden: 'Las contraseñas no coinciden'
    }
  }
};

// ==================== FUNCIONES DE VALIDACIÓN ====================

function validarNombre(nombre) {
  const errors = [];

  if (!nombre || nombre.trim() === '') {
    errors.push(VALIDACIONES.nombre.mensajes.vacio);
    return errors;
  }

  if (nombre.length < VALIDACIONES.nombre.minLength) {
    errors.push(VALIDACIONES.nombre.mensajes.corto);
  }

  if (nombre.length > VALIDACIONES.nombre.maxLength) {
    errors.push(VALIDACIONES.nombre.mensajes.largo);
  }

  if (!VALIDACIONES.nombre.regex.test(nombre)) {
    errors.push(VALIDACIONES.nombre.mensajes.invalido);
  }

  return errors;
}

function validarEmail(email) {
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push(VALIDACIONES.email.mensajes.vacio);
    return errors;
  }

  if (!VALIDACIONES.email.regex.test(email)) {
    errors.push(VALIDACIONES.email.mensajes.invalido);
  }

  return errors;
}

function validarPassword(password) {
  const errors = [];

  if (!password || password === '') {
    errors.push(VALIDACIONES.password.mensajes.vacio);
    return errors;
  }

  if (password.length < VALIDACIONES.password.minLength) {
    errors.push(VALIDACIONES.password.mensajes.corta);
    return errors;
  }

  if (password.length > VALIDACIONES.password.maxLength) {
    errors.push(VALIDACIONES.password.mensajes.larga);
  }

  // Validaciones individuales
  if (!/[A-Z]/.test(password)) {
    errors.push(VALIDACIONES.password.mensajes.noMayuscula);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(VALIDACIONES.password.mensajes.noMinuscula);
  }

  if (!/[0-9]/.test(password)) {
    errors.push(VALIDACIONES.password.mensajes.noNumero);
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(VALIDACIONES.password.mensajes.noEspecial);
  }

  return errors;
}

function validarConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return [VALIDACIONES.password.mensajes.noCoinciden];
  }
  return [];
}

// ==================== FUNCIONES DE FORTALEZA DE CONTRASEÑA ====================

function evaluarFortalezaPassword(password) {
  let fortaleza = 0;

  if (!password) return { nivel: 'weak', texto: 'Débil' };

  if (password.length >= 8) fortaleza++;
  if (password.length >= 12) fortaleza++;
  if (/[A-Z]/.test(password)) fortaleza++;
  if (/[a-z]/.test(password)) fortaleza++;
  if (/[0-9]/.test(password)) fortaleza++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) fortaleza++;

  if (fortaleza <= 2) return { nivel: 'weak', texto: 'Débil' };
  if (fortaleza <= 4) return { nivel: 'medium', texto: 'Media' };
  return { nivel: 'strong', texto: 'Fuerte' };
}

// ==================== VALIDACIÓN DINÁMICA EN TIEMPO REAL ====================

function actualizarRequiremientosPassword(password) {
  const requirements = {
    length: password.length >= VALIDACIONES.password.minLength,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  return requirements;
}

function actualizarVisualesRequiremientos(requirements) {
  const elements = {
    'length': document.getElementById('req-length'),
    'upper': document.getElementById('req-upper'),
    'lower': document.getElementById('req-lower'),
    'number': document.getElementById('req-number'),
    'special': document.getElementById('req-special')
  };

  for (const [key, met] of Object.entries(requirements)) {
    if (elements[key]) {
      if (met) {
        elements[key].classList.add('met');
      } else {
        elements[key].classList.remove('met');
      }
    }
  }
}

// ==================== MOSTRAR Y OCULTAR MENSAJES ====================

function mostrarError(elementId, mensaje) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    if (mensaje) {
      errorEl.textContent = mensaje;
      errorEl.classList.add('show');
    } else {
      errorEl.classList.remove('show');
    }
  }
}

function mostrarExito(elementId, mensaje = '✓ Válido') {
  const successEl = document.getElementById(elementId);
  if (successEl) {
    if (mensaje) {
      successEl.textContent = mensaje;
      successEl.classList.add('show');
    } else {
      successEl.classList.remove('show');
    }
  }
}

function mostrarAlerta(tipo, mensaje) {
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

// ==================== UTILIDADES ====================

function limpiarErrores(elementIds) {
  elementIds.forEach(id => {
    mostrarError(id, '');
    mostrarExito(id, '');
  });
}

function deshabilitarElemento(elementId, deshabilitar = true) {
  const element = document.getElementById(elementId);
  if (element) {
    element.disabled = deshabilitar;
  }
}

function mostrarLoader(elementId, mostrar = true) {
  const btn = document.getElementById(elementId);
  if (!btn) return;

  if (mostrar) {
    btn.innerHTML = '<span class="loading-spinner"></span>Procesando...';
    btn.disabled = true;
  } else {
    btn.innerHTML = elementId === 'btnSubmit' && window.location.pathname.includes('registro') 
      ? 'Crear Cuenta' 
      : elementId === 'btnSubmit' && window.location.pathname.includes('login')
      ? 'Iniciar Sesión'
      : 'Enviar';
    btn.disabled = false;
  }
}
