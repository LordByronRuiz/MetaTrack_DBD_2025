// listas.js - Gestión de proyectos en MetaTrack

// Clase Proyecto
class Proyecto {
    constructor(id, nombre, descripcion, estado, fechaLimite, fechaCreacion = new Date(), 
                prioridad = 'media', categoria = '', presupuesto = 0, etiquetas = [], progreso = 0,
                archivos = [], carpetas = [], bocetos = [], archivosCodigo = [], tareas = [], notas = '') {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.estado = estado;
        this.fechaLimite = fechaLimite;
        this.fechaCreacion = fechaCreacion;
        this.prioridad = prioridad;
        this.categoria = categoria;
        this.presupuesto = presupuesto;
        this.etiquetas = etiquetas;
        this.progreso = progreso;
        this.archivos = archivos;
        this.carpetas = carpetas;
        this.bocetos = bocetos;
        this.archivosCodigo = archivosCodigo;
        this.tareas = tareas;
        this.notas = notas;
    }
}

// Gestor de proyectos
class GestorProyectos {
    constructor() {
        this.proyectos = this.cargarProyectos();
        this.proyectoEditando = null;
        this.inicializarEventos();
        this.renderizarProyectos();
    }

    // Cargar proyectos desde localStorage
    cargarProyectos() {
        const proyectosGuardados = localStorage.getItem('metaTrack_proyectos');
        return proyectosGuardados ? JSON.parse(proyectosGuardados) : [];
    }

    // Guardar proyectos en localStorage
    guardarProyectos() {
        localStorage.setItem('metaTrack_proyectos', JSON.stringify(this.proyectos));
    }

    // Generar ID único
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Inicializar eventos
    inicializarEventos() {
        // Botón crear proyecto
        document.getElementById('crearProyectoBtn').addEventListener('click', () => {
            this.mostrarModal();
        });

        // Cerrar modal
        document.getElementById('cerrarModal').addEventListener('click', () => {
            this.ocultarModal();
        });

        // Cancelar proyecto
        document.getElementById('cancelarProyecto').addEventListener('click', () => {
            this.ocultarModal();
        });

        // Enviar formulario
        document.getElementById('proyectoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarProyecto();
        });

        // Buscar proyectos
        document.getElementById('buscarProyecto').addEventListener('input', (e) => {
            this.filtrarProyectos();
        });

        // Filtrar por estado
        document.getElementById('filtroEstado').addEventListener('change', () => {
            this.filtrarProyectos();
        });

        // Cerrar modal haciendo click fuera
        document.getElementById('proyectoModal').addEventListener('click', (e) => {
            if (e.target.id === 'proyectoModal') {
                this.ocultarModal();
            }
        });

        // Inicializar campos adicionales del formulario
        this.inicializarFormulario();
    }

    // Inicializar campos del formulario
    inicializarFormulario() {
        // Actualizar el formulario en el HTML para incluir los nuevos campos
        const form = document.getElementById('proyectoForm');
        if (!document.getElementById('proyectoPrioridad')) {
            const prioridadGroup = document.createElement('div');
            prioridadGroup.className = 'form-group';
            prioridadGroup.innerHTML = `
                <label for="proyectoPrioridad">Prioridad</label>
                <select id="proyectoPrioridad">
                    <option value="baja">Baja</option>
                    <option value="media" selected>Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                </select>
            `;
            form.insertBefore(prioridadGroup, document.getElementById('proyectoEstado').parentElement);
        }

        if (!document.getElementById('proyectoCategoria')) {
            const categoriaGroup = document.createElement('div');
            categoriaGroup.className = 'form-group';
            categoriaGroup.innerHTML = `
                <label for="proyectoCategoria">Categoría</label>
                <select id="proyectoCategoria">
                    <option value="">Sin categoría</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="personal">Personal</option>
                    <option value="estudio">Estudio</option>
                    <option value="salud">Salud</option>
                    <option value="finanzas">Finanzas</option>
                    <option value="hobbies">Hobbies</option>
                </select>
            `;
            form.insertBefore(categoriaGroup, document.getElementById('proyectoEstado').parentElement);
        }

        if (!document.getElementById('proyectoPresupuesto')) {
            const presupuestoGroup = document.createElement('div');
            presupuestoGroup.className = 'form-group';
            presupuestoGroup.innerHTML = `
                <label for="proyectoPresupuesto">Presupuesto (opcional)</label>
                <input type="number" id="proyectoPresupuesto" placeholder="0.00" step="0.01" min="0">
            `;
            form.insertBefore(presupuestoGroup, document.getElementById('proyectoEstado').parentElement);
        }

        if (!document.getElementById('proyectoEtiquetas')) {
            const etiquetasGroup = document.createElement('div');
            etiquetasGroup.className = 'form-group';
            etiquetasGroup.innerHTML = `
                <label for="proyectoEtiquetas">Etiquetas (separadas por comas)</label>
                <input type="text" id="proyectoEtiquetas" placeholder="web, diseño, desarrollo">
            `;
            form.insertBefore(etiquetasGroup, document.getElementById('proyectoEstado').parentElement);
        }
    }

    // Mostrar modal
    mostrarModal(proyecto = null) {
        const modal = document.getElementById('proyectoModal');
        const titulo = document.getElementById('modalTitulo');
        const form = document.getElementById('proyectoForm');

        if (proyecto) {
            // Modo edición
            titulo.textContent = 'Editar Proyecto';
            this.proyectoEditando = proyecto;
            this.llenarFormulario(proyecto);
        } else {
            // Modo creación
            titulo.textContent = 'Nuevo Proyecto';
            this.proyectoEditando = null;
            form.reset();
            // Establecer valores por defecto
            document.getElementById('proyectoEstado').value = 'activo';
            document.getElementById('proyectoPrioridad').value = 'media';
        }

        modal.style.display = 'flex';
        document.getElementById('proyectoNombre').focus();
    }

    // Ocultar modal
    ocultarModal() {
        document.getElementById('proyectoModal').style.display = 'none';
        this.proyectoEditando = null;
        document.getElementById('proyectoForm').reset();
    }

    // Llenar formulario con datos del proyecto
    llenarFormulario(proyecto) {
        document.getElementById('proyectoNombre').value = proyecto.nombre;
        document.getElementById('proyectoDescripcion').value = proyecto.descripcion || '';
        document.getElementById('proyectoEstado').value = proyecto.estado;
        document.getElementById('proyectoPrioridad').value = proyecto.prioridad || 'media';
        document.getElementById('proyectoCategoria').value = proyecto.categoria || '';
        document.getElementById('proyectoPresupuesto').value = proyecto.presupuesto || '';
        document.getElementById('proyectoEtiquetas').value = proyecto.etiquetas ? proyecto.etiquetas.join(', ') : '';
        
        if (proyecto.fechaLimite) {
            const fecha = new Date(proyecto.fechaLimite);
            document.getElementById('proyectoFecha').value = fecha.toISOString().split('T')[0];
        } else {
            document.getElementById('proyectoFecha').value = '';
        }
    }

    // Guardar proyecto (crear o editar)
    guardarProyecto() {
        const nombre = document.getElementById('proyectoNombre').value.trim();
        const descripcion = document.getElementById('proyectoDescripcion').value.trim();
        const estado = document.getElementById('proyectoEstado').value;
        const prioridad = document.getElementById('proyectoPrioridad').value;
        const categoria = document.getElementById('proyectoCategoria').value;
        const presupuesto = parseFloat(document.getElementById('proyectoPresupuesto').value) || 0;
        const etiquetas = document.getElementById('proyectoEtiquetas').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const fechaLimite = document.getElementById('proyectoFecha').value;

        if (!nombre) {
            this.mostrarAlerta('El nombre del proyecto es obligatorio', 'error');
            return;
        }

        let proyecto;

        if (this.proyectoEditando) {
            // Editar proyecto existente
            proyecto = this.proyectoEditando;
            proyecto.nombre = nombre;
            proyecto.descripcion = descripcion;
            proyecto.estado = estado;
            proyecto.prioridad = prioridad;
            proyecto.categoria = categoria;
            proyecto.presupuesto = presupuesto;
            proyecto.etiquetas = etiquetas;
            proyecto.fechaLimite = fechaLimite || null;
        } else {
            // Crear nuevo proyecto
            proyecto = new Proyecto(
                this.generarId(),
                nombre,
                descripcion,
                estado,
                fechaLimite || null,
                new Date(),
                prioridad,
                categoria,
                presupuesto,
                etiquetas
            );
            this.proyectos.push(proyecto);
        }

        this.guardarProyectos();
        this.renderizarProyectos();
        this.ocultarModal();
        
        const mensaje = this.proyectoEditando ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente';
        this.mostrarAlerta(mensaje, 'success');
    }

    // Eliminar proyecto
    eliminarProyecto(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
            this.proyectos = this.proyectos.filter(proyecto => proyecto.id !== id);
            this.guardarProyectos();
            this.renderizarProyectos();
            this.mostrarAlerta('Proyecto eliminado correctamente', 'success');
        }
    }

    // Filtrar proyectos
    filtrarProyectos() {
        const terminoBusqueda = document.getElementById('buscarProyecto').value.toLowerCase();
        const filtroEstado = document.getElementById('filtroEstado').value;

        let proyectosFiltrados = this.proyectos;

        // Filtrar por búsqueda
        if (terminoBusqueda) {
            proyectosFiltrados = proyectosFiltrados.filter(proyecto =>
                proyecto.nombre.toLowerCase().includes(terminoBusqueda) ||
                (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(terminoBusqueda)) ||
                (proyecto.categoria && proyecto.categoria.toLowerCase().includes(terminoBusqueda)) ||
                (proyecto.etiquetas && proyecto.etiquetas.some(tag => tag.toLowerCase().includes(terminoBusqueda)))
            );
        }

        // Filtrar por estado
        if (filtroEstado) {
            proyectosFiltrados = proyectosFiltrados.filter(proyecto => proyecto.estado === filtroEstado);
        }

        this.renderizarProyectos(proyectosFiltrados);
    }

    // Renderizar proyectos
    renderizarProyectos(proyectos = this.proyectos) {
        const contenedor = document.getElementById('proyectosLista');

        if (proyectos.length === 0) {
            contenedor.innerHTML = this.obtenerHTMLProyectoVacio();
            return;
        }

        contenedor.innerHTML = proyectos.map(proyecto => this.obtenerHTMLProyecto(proyecto)).join('');
        
        // Agregar eventos a los botones después de renderizar
        this.agregarEventosProyectos();
    }

    // Obtener HTML para proyecto vacío
    obtenerHTMLProyectoVacio() {
        return `
            <div class="proyecto-vacio">
                <i class="fas fa-folder-plus"></i>
                <h3>No tienes proyectos aún</h3>
                <p>Crea tu primer proyecto para comenzar a organizar tus metas</p>
                <button class="btn btn-primary" onclick="document.getElementById('crearProyectoBtn').click()">
                    Crear Primer Proyecto
                </button>
            </div>
        `;
    }

    // Obtener HTML para un proyecto (COMPLETA Y ACTUALIZADA)
    obtenerHTMLProyecto(proyecto) {
        const fechaLimite = proyecto.fechaLimite ? 
            new Date(proyecto.fechaLimite).toLocaleDateString('es-ES') : 
            'Sin fecha límite';

        const iconoEstado = this.obtenerIconoEstado(proyecto.estado);
        const claseEstado = this.obtenerClaseEstado(proyecto.estado);
        const prioridad = proyecto.prioridad || 'media';
        const clasePrioridad = `prioridad-${prioridad}`;
        const textoPrioridad = this.obtenerTextoPrioridad(prioridad);
        const categoria = proyecto.categoria || 'Sin categoría';
        const progreso = proyecto.progreso || 0;

        return `
            <div class="proyecto-card" data-id="${proyecto.id}" onclick="window.location.href='Proyectos/detalle-proyecto.html?id=${proyecto.id}'">
                <div class="proyecto-header">
                    <div class="proyecto-titulo-container">
                        <h3 class="proyecto-titulo">${this.escapeHTML(proyecto.nombre)}</h3>
                        <div class="proyecto-meta-info">
                            <span class="proyecto-categoria">${this.escapeHTML(categoria)}</span>
                            <span class="proyecto-prioridad ${clasePrioridad}">${textoPrioridad}</span>
                        </div>
                    </div>
                    <span class="proyecto-estado ${claseEstado}">
                        <i class="${iconoEstado}"></i>
                        ${this.obtenerTextoEstado(proyecto.estado)}
                    </span>
                </div>
                
                ${proyecto.descripcion ? `
                    <p class="proyecto-descripcion">${this.escapeHTML(proyecto.descripcion)}</p>
                ` : ''}
                
                <!-- Barra de progreso -->
                <div class="proyecto-progreso-container">
                    <div class="progreso-info">
                        <span>Progreso</span>
                        <span>${progreso}%</span>
                    </div>
                    <div class="progreso-bar">
                        <div class="progreso-fill" style="width: ${progreso}%"></div>
                    </div>
                </div>

                <div class="proyecto-info">
                    <div class="proyecto-fecha">
                        <i class="far fa-calendar"></i>
                        ${fechaLimite}
                    </div>
                    <div class="proyecto-stats">
                        <span class="proyecto-stat">
                            <i class="fas fa-tasks"></i>
                            ${proyecto.tareas ? proyecto.tareas.length : 0} tareas
                        </span>
                        <span class="proyecto-stat">
                            <i class="fas fa-file"></i>
                            ${proyecto.archivos ? proyecto.archivos.length : 0} archivos
                        </span>
                    </div>
                </div>

                <div class="proyecto-acciones">
                    <button class="btn btn-icon btn-editar" title="Editar proyecto" onclick="event.stopPropagation()">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-eliminar" title="Eliminar proyecto" onclick="event.stopPropagation()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Agregar eventos a los proyectos renderizados
    agregarEventosProyectos() {
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevenir que se active el click del card
                const proyectoCard = e.target.closest('.proyecto-card');
                const proyectoId = proyectoCard.dataset.id;
                const proyecto = this.proyectos.find(p => p.id === proyectoId);
                if (proyecto) {
                    this.mostrarModal(proyecto);
                }
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevenir que se active el click del card
                const proyectoCard = e.target.closest('.proyecto-card');
                const proyectoId = proyectoCard.dataset.id;
                this.eliminarProyecto(proyectoId);
            });
        });
    }

    // Utilidades para estados
    obtenerIconoEstado(estado) {
        const iconos = {
            activo: 'fas fa-play-circle',
            pausado: 'fas fa-pause-circle',
            completado: 'fas fa-check-circle'
        };
        return iconos[estado] || 'fas fa-circle';
    }

    obtenerClaseEstado(estado) {
        const clases = {
            activo: 'estado-activo',
            pausado: 'estado-pausado',
            completado: 'estado-completado'
        };
        return clases[estado] || 'estado-activo';
    }

    obtenerTextoEstado(estado) {
        const textos = {
            activo: 'Activo',
            pausado: 'Pausado',
            completado: 'Completado'
        };
        return textos[estado] || 'Activo';
    }

    obtenerTextoPrioridad(prioridad) {
        const prioridades = {
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta',
            'urgente': 'Urgente'
        };
        return prioridades[prioridad] || prioridad;
    }

    // Mostrar alerta
    mostrarAlerta(mensaje, tipo) {
        // Crear elemento de alerta
        const alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        alerta.innerHTML = `
            <span>${mensaje}</span>
            <button class="alerta-cerrar">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Estilos para la alerta
        alerta.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        if (tipo === 'success') {
            alerta.style.backgroundColor = '#10b981';
        } else if (tipo === 'error') {
            alerta.style.backgroundColor = '#ef4444';
        }

        // Botón cerrar
        const btnCerrar = alerta.querySelector('.alerta-cerrar');
        btnCerrar.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            font-size: 14px;
        `;

        btnCerrar.addEventListener('click', () => {
            alerta.remove();
        });

        document.body.appendChild(alerta);

        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 4000);
    }

    // Escapar HTML para prevenir XSS
    escapeHTML(texto) {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new GestorProyectos();
});

// Agregar estilos CSS para las animaciones
const estilos = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .proyecto-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        position: relative;
    }

    .proyecto-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .proyecto-titulo-container {
        flex: 1;
    }

    .proyecto-meta-info {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .proyecto-categoria {
        background-color: #e5e7eb;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        color: #6b7280;
    }

    .proyecto-prioridad {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .prioridad-baja {
        background-color: #f3f4f6;
        color: #374151;
    }

    .prioridad-media {
        background-color: #fef3c7;
        color: #92400e;
    }

    .prioridad-alta {
        background-color: #fecaca;
        color: #991b1b;
    }

    .prioridad-urgente {
        background-color: #fca5a5;
        color: #dc2626;
    }

    .proyecto-progreso-container {
        margin: 1rem 0;
    }

    .progreso-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
    }

    .progreso-bar {
        width: 100%;
        height: 6px;
        background-color: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
    }

    .progreso-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        transition: width 0.3s ease;
    }

    .proyecto-stats {
        display: flex;
        gap: 1rem;
    }

    .proyecto-stat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: #6b7280;
    }

    .proyecto-acciones {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .proyecto-card:hover .proyecto-acciones {
        opacity: 1;
    }

    .btn-icon {
        padding: 0.5rem;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s ease;
    }

    .btn-icon:hover {
        background-color: #f3f4f6;
        color: #374151;
    }
`;

// Injectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = estilos;
document.head.appendChild(styleSheet);