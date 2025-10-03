// Variables globales
let isLoading = false;

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeRegisterForm();
    initializePasswordToggle();
    initializePasswordStrength();
    initializeSocialButtons();
    initializeAnimations();
});

// Inicializar el formulario de registro
function initializeRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', handleRegisterSubmit);
    
    // Validación en tiempo real
    const inputs = ['fullName', 'email', 'password', 'confirmPassword'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                validateField(this.id);
            });
        }
    });
}

// Toggle para mostrar/ocultar contraseña
function initializePasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input) {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                // Cambiar ícono
                const icon = this.querySelector('i');
                if (icon) {
                    if (type === 'text') {
                        icon.className = 'fas fa-eye-slash';
                    } else {
                        icon.className = 'fas fa-eye';
                    }
                }
            }
        });
    });
}

// Inicializar medidor de fuerza de contraseña
function initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', updatePasswordStrength);
}

// Inicializar botones sociales
function initializeSocialButtons() {
    const googleBtn = document.querySelector('.google-btn');
    const githubBtn = document.querySelector('.github-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleRegister);
    }
    
    if (githubBtn) {
        githubBtn.addEventListener('click', handleGithubRegister);
    }
}

// Inicializar animaciones
function initializeAnimations() {
    // Las animaciones CSS ya están implementadas
}

// Manejar envío del formulario
function handleRegisterSubmit(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    // Validar formulario completo
    if (!validateForm()) {
        showNotification('Por favor, complete todos los campos correctamente.', 'error');
        return;
    }
    
    // Validar que las contraseñas coincidan
    if (!validatePasswordMatch()) {
        showNotification('Las contraseñas no coinciden.', 'error');
        return;
    }
    
    // Validar términos y condiciones
    if (!document.getElementById('terms').checked) {
        showNotification('Debes aceptar los términos y condiciones.', 'error');
        return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const registerData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        newsletter: formData.get('newsletter') === 'on',
        terms: formData.get('terms') === 'on'
    };
    
    // Mostrar estado de carga
    setLoadingState(true);
    
    // Simular registro (en un caso real, sería una llamada fetch)
    simulateRegister(registerData)
        .then(handleRegisterSuccess)
        .catch(handleRegisterError)
        .finally(() => setLoadingState(false));
}

// Validar campo individual
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return false;
    
    const value = field.value.trim();
    
    switch (fieldId) {
        case 'fullName':
            return validateFullName(value);
        case 'email':
            return validateEmail(value);
        case 'password':
            return validatePassword(value);
        case 'confirmPassword':
            return validateConfirmPassword(value);
        default:
            return true;
    }
}

// Validar nombre completo
function validateFullName(fullName) {
    const isValid = fullName.length >= 3 && fullName.includes(' ');
    const field = document.getElementById('fullName');
    
    if (isValid) {
        setValidState(field);
    } else if (fullName.length > 0) {
        setInvalidState(field);
    } else {
        removeValidationState(field);
    }
    
    return isValid;
}

// Validar email
function validateEmail(email) {
    const isValid = isValidEmail(email);
    const field = document.getElementById('email');
    
    if (isValid) {
        setValidState(field);
    } else if (email.length > 0) {
        setInvalidState(field);
    } else {
        removeValidationState(field);
    }
    
    return isValid;
}

// Validar contraseña
function validatePassword(password) {
    const isValid = password.length >= 6;
    const field = document.getElementById('password');
    
    if (isValid) {
        setValidState(field);
    } else if (password.length > 0) {
        setInvalidState(field);
    } else {
        removeValidationState(field);
    }
    
    return isValid;
}

// Validar confirmación de contraseña
function validateConfirmPassword(confirmPassword) {
    const password = document.getElementById('password').value;
    const isValid = confirmPassword === password && confirmPassword.length >= 6;
    const field = document.getElementById('confirmPassword');
    
    if (isValid) {
        setValidState(field);
    } else if (confirmPassword.length > 0) {
        setInvalidState(field);
    } else {
        removeValidationState(field);
    }
    
    return isValid;
}

// Validar que las contraseñas coincidan
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    return password === confirmPassword && password.length >= 6;
}

// Validar formulario completo
function validateForm() {
    const fields = ['fullName', 'email', 'password', 'confirmPassword'];
    return fields.every(field => validateField(field));
}

// Validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Actualizar medidor de fuerza de contraseña
function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    if (password.length === 0) {
        strengthFill.style.width = '0%';
        strengthFill.style.backgroundColor = '#ddd';
        strengthText.textContent = 'Seguridad de la contraseña';
        strengthText.style.color = '#666';
        return;
    }
    
    let strength = 0;
    let message = '';
    let color = '';
    
    // Longitud
    if (password.length >= 8) strength += 25;
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Números
    if (/[0-9]/.test(password)) strength += 25;
    
    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    // Determinar mensaje y color
    if (strength <= 25) {
        message = 'Débil';
        color = '#f44336';
    } else if (strength <= 50) {
        message = 'Regular';
        color = '#ff9800';
    } else if (strength <= 75) {
        message = 'Buena';
        color = '#4caf50';
    } else {
        message = 'Excelente';
        color = '#2196f3';
    }
    
    strengthFill.style.width = strength + '%';
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = message;
    strengthText.style.color = color;
}

// Estados de validación visual
function setValidState(input) {
    input.classList.remove('invalid');
    input.classList.add('valid');
}

function setInvalidState(input) {
    input.classList.remove('valid');
    input.classList.add('invalid');
}

function removeValidationState(input) {
    input.classList.remove('valid', 'invalid');
}

// Estado de carga
function setLoadingState(loading) {
    isLoading = loading;
    const registerBtn = document.querySelector('.register-btn');
    
    if (registerBtn) {
        if (loading) {
            registerBtn.classList.add('loading');
            registerBtn.disabled = true;
        } else {
            registerBtn.classList.remove('loading');
            registerBtn.disabled = false;
        }
    }
}

// Simular registro (en producción, reemplazar con llamada real a API)
function simulateRegister(registerData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular diferentes casos
            if (registerData.email === 'existente@ejemplo.com') {
                reject({
                    success: false,
                    message: 'Este correo electrónico ya está registrado',
                    code: 'EMAIL_EXISTS'
                });
            } else if (registerData.email === 'error@ejemplo.com') {
                reject({
                    success: false,
                    message: 'Error del servidor',
                    code: 'SERVER_ERROR'
                });
            } else {
                resolve({
                    success: true,
                    message: '¡Cuenta creada exitosamente!',
                    user: {
                        id: Math.floor(Math.random() * 1000),
                        name: registerData.fullName,
                        email: registerData.email,
                        avatar: null,
                        joined: new Date().toISOString()
                    },
                    token: 'register-token-' + Math.random().toString(36).substr(2)
                });
            }
        }, 2000); // Simular delay de red
    });
}

// Manejar registro exitoso
function handleRegisterSuccess(response) {
    showNotification(response.message, 'success');
    
    // Guardar datos de sesión
    if (response.user && response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
    }
    
    // Redirigir después de registro exitoso
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

// Manejar error de registro
function handleRegisterError(error) {
    const message = error.message || 'Error al crear la cuenta';
    showNotification(message, 'error');
}

// Registro con Google
function handleGoogleRegister() {
    if (isLoading) return;
    
    setLoadingState(true);
    
    // Simular registro con Google
    setTimeout(() => {
        showNotification('Registro con Google simulado', 'info');
        setLoadingState(false);
        
        // En producción, integrar con Google OAuth
        console.log('Integrar con Google OAuth aquí');
    }, 1000);
}

// Registro con GitHub
function handleGithubRegister() {
    if (isLoading) return;
    
    setLoadingState(true);
    
    // Simular registro con GitHub
    setTimeout(() => {
        showNotification('Registro con GitHub simulado', 'info');
        setLoadingState(false);
        
        // En producción, integrar con GitHub OAuth
        console.log('Integrar con GitHub OAuth aquí');
    }, 1000);
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Agregar al documento
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Obtener ícono para notificación
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

// Obtener color para notificación
function getNotificationColor(type) {
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    return colors[type] || '#2196f3';
}

// Verificar si ya hay una sesión activa
function checkExistingSession() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (token && userData) {
        // Si ya hay sesión, redirigir al home
        window.location.href = '../index.html';
    }
}

// Utilidades adicionales
function formatEmail(email) {
    return email.toLowerCase().trim();
}

function generatePasswordHash(password) {
    // En producción, usar una librería de hashing como bcrypt
    return btoa(password); // Solo para demo, no usar en producción
}

// Exportar funciones para uso global
window.registerUtils = {
    validateField,
    validateForm,
    showNotification
};

// Inicializar verificación de sesión al cargar
checkExistingSession();