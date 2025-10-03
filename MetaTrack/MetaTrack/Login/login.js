// Variables globales
let isLoading = false;

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializePasswordToggle();
    initializeSocialButtons();
    initializeAnimations();
});

// Inicializar el formulario de login
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Validación en tiempo real
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('input', validateEmail);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }
}

// Toggle para mostrar/ocultar contraseña
function initializePasswordToggle() {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar ícono
            const icon = this.querySelector('i');
            if (icon) {
                if (type === 'text') {
                    icon.className = 'fas fa-eye-slash';
                } else {
                    icon.className = 'fas fa-eye';
                }
            }
        });
    }
}

// Inicializar botones sociales
function initializeSocialButtons() {
    const googleBtn = document.querySelector('.google-btn');
    const githubBtn = document.querySelector('.github-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }
    
    if (githubBtn) {
        githubBtn.addEventListener('click', handleGithubLogin);
    }
}

// Inicializar animaciones
function initializeAnimations() {
    // Las animaciones CSS ya están implementadas
    // Aquí se pueden agregar animaciones adicionales con JavaScript si es necesario
}

// Manejar envío del formulario
function handleLoginSubmit(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    // Validar formulario
    if (!validateForm()) {
        showNotification('Por favor, complete todos los campos correctamente.', 'error');
        return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember') === 'on'
    };
    
    // Mostrar estado de carga
    setLoadingState(true);
    
    // Simular llamada a API (en un caso real, sería una llamada fetch)
    simulateLogin(loginData)
        .then(handleLoginSuccess)
        .catch(handleLoginError)
        .finally(() => setLoadingState(false));
}

// Validar email en tiempo real
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (!email) {
        removeValidationState(emailInput);
        return false;
    }
    
    const isValid = isValidEmail(email);
    
    if (isValid) {
        setValidState(emailInput);
    } else {
        setInvalidState(emailInput);
    }
    
    return isValid;
}

// Validar contraseña en tiempo real
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    if (!password) {
        removeValidationState(passwordInput);
        return false;
    }
    
    const isValid = password.length >= 6;
    
    if (isValid) {
        setValidState(passwordInput);
    } else {
        setInvalidState(passwordInput);
    }
    
    return isValid;
}

// Validar formulario completo
function validateForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    return isEmailValid && isPasswordValid;
}

// Validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    const loginBtn = document.querySelector('.login-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    if (loginBtn) {
        if (loading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    }
}

// Simular login (en producción, reemplazar con llamada real a API)
function simulateLogin(loginData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular diferentes casos
            if (loginData.email === 'demo@metatrack.com' && loginData.password === 'password123') {
                resolve({
                    success: true,
                    message: 'Login exitoso',
                    user: {
                        id: 1,
                        name: 'Usuario Demo',
                        email: loginData.email,
                        avatar: null
                    },
                    token: 'demo-token-123456'
                });
            } else if (loginData.email === 'error@example.com') {
                reject({
                    success: false,
                    message: 'Error del servidor',
                    code: 'SERVER_ERROR'
                });
            } else {
                reject({
                    success: false,
                    message: 'Credenciales incorrectas',
                    code: 'INVALID_CREDENTIALS'
                });
            }
        }, 1500); // Simular delay de red
    });
}

// Manejar login exitoso
function handleLoginSuccess(response) {
    showNotification(response.message, 'success');
    
    // Guardar datos de sesión si "Recordarme" está activado
    if (response.user && response.token) {
        const remember = document.querySelector('input[name="remember"]').checked;
        
        if (remember) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
        } else {
            sessionStorage.setItem('authToken', response.token);
            sessionStorage.setItem('userData', JSON.stringify(response.user));
        }
    }
    
    // Redirigir después de login exitoso
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
}

// Manejar error de login
function handleLoginError(error) {
    const message = error.message || 'Error al iniciar sesión';
    showNotification(message, 'error');
}

// Login con Google
function handleGoogleLogin() {
    if (isLoading) return;
    
    setLoadingState(true);
    
    // Simular login con Google
    setTimeout(() => {
        showNotification('Inicio de sesión con Google simulado', 'info');
        setLoadingState(false);
        
        // En producción, integrar con Google OAuth
        console.log('Integrar con Google OAuth aquí');
    }, 1000);
}

// Login con GitHub
function handleGithubLogin() {
    if (isLoading) return;
    
    setLoadingState(true);
    
    // Simular login con GitHub
    setTimeout(() => {
        showNotification('Inicio de sesión con GitHub simulado', 'info');
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

// Cerrar sesión
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    
    window.location.href = 'login.html';
}

// Verificar autenticación en otras páginas
function checkAuthentication() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token && window.location.pathname !== '/Login/login.html') {
        window.location.href = '/Login/login.html';
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

// Exportar funciones para uso global (si es necesario)
window.loginUtils = {
    validateEmail,
    validatePassword,
    showNotification,
    logout,
    checkAuthentication
};

// Inicializar verificación de sesión al cargar
checkExistingSession();