// detalle-proyecto.js - Gestión de detalle de proyectos

class GestorDetalleProyecto {
    constructor() {
        this.proyecto = null;
        this.proyectoId = this.obtenerIdDeURL();
        this.archivoEditando = null;
        this.inicializarEventos();
        this.cargarProyecto();
    }

    obtenerIdDeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    inicializarEventos() {
        // Navegación - CORREGIDO PARA VOLVER A LISTAS.HTML
        const volverBtn = document.getElementById('volverListas');
        if (volverBtn) {
            volverBtn.addEventListener('click', () => {
                window.location.href = '../listas.html'; // ← CORREGIDO
            });
        }

        // Navegación entre secciones - CORREGIDO
        document.querySelectorAll('.seccion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seccion = e.currentTarget.dataset.seccion;
                if (seccion) {
                    this.cambiarSeccion(seccion);
                }
            });
        });

        // Archivos - CORREGIDO
        const crearCarpetaBtn = document.getElementById('crearCarpetaBtn');
        const subirArchivoBtn = document.getElementById('subirArchivoBtn');
        const fileInput = document.getElementById('fileInput');
        
        if (crearCarpetaBtn) {
            crearCarpetaBtn.addEventListener('click', () => {
                this.mostrarModalCarpeta();
            });
        }
        
        if (subirArchivoBtn && fileInput) {
            subirArchivoBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.subirArchivos(e.target.files);
            });
        }

        // Bocetos - CORREGIDO
        const subirBocetoBtn = document.getElementById('subirBocetoBtn');
        const nuevoBocetoBtn = document.getElementById('nuevoBocetoBtn');
        const bocetoInput = document.getElementById('bocetoInput');
        
        if (subirBocetoBtn && bocetoInput) {
            subirBocetoBtn.addEventListener('click', () => {
                bocetoInput.click();
            });
            
            bocetoInput.addEventListener('change', (e) => {
                this.subirBocetos(e.target.files);
            });
        }
        
        if (nuevoBocetoBtn) {
            nuevoBocetoBtn.addEventListener('click', () => {
                this.crearNuevoBoceto();
            });
        }

        // Código - CORREGIDO
        const nuevoArchivoCodigoBtn = document.getElementById('nuevoArchivoCodigoBtn');
        const guardarCodigoBtn = document.getElementById('guardarCodigoBtn');
        
        if (nuevoArchivoCodigoBtn) {
            nuevoArchivoCodigoBtn.addEventListener('click', () => {
                this.crearNuevoArchivoCodigo();
            });
        }
        
        if (guardarCodigoBtn) {
            guardarCodigoBtn.addEventListener('click', () => {
                this.guardarArchivoCodigo();
            });
        }

        // Tareas - CORREGIDO
        const nuevaTareaBtn = document.getElementById('nuevaTareaBtn');
        if (nuevaTareaBtn) {
            nuevaTareaBtn.addEventListener('click', () => {
                this.crearNuevaTarea();
            });
        }

        // Notas - CORREGIDO
        const guardarNotasBtn = document.getElementById('guardarNotasBtn');
        if (guardarNotasBtn) {
            guardarNotasBtn.addEventListener('click', () => {
                this.guardarNotas();
            });
        }

        // Modal carpetas - CORREGIDO
        const cerrarCarpetaModal = document.getElementById('cerrarCarpetaModal');
        const cancelarCarpeta = document.getElementById('cancelarCarpeta');
        const carpetaForm = document.getElementById('carpetaForm');
        const carpetaModal = document.getElementById('carpetaModal');
        
        if (cerrarCarpetaModal) {
            cerrarCarpetaModal.addEventListener('click', () => {
                this.ocultarModalCarpeta();
            });
        }
        
        if (cancelarCarpeta) {
            cancelarCarpeta.addEventListener('click', () => {
                this.ocultarModalCarpeta();
            });
        }
        
        if (carpetaForm) {
            carpetaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.crearCarpeta();
            });
        }
        
        if (carpetaModal) {
            carpetaModal.addEventListener('click', (e) => {
                if (e.target.id === 'carpetaModal') {
                    this.ocultarModalCarpeta();
                }
            });
        }

        // Modal editar proyecto - NUEVA FUNCIONALIDAD
        const editarProyectoBtn = document.getElementById('editarProyectoBtn');
        const cerrarEditarModal = document.getElementById('cerrarEditarModal');
        const editarProyectoModal = document.getElementById('editarProyectoModal');
        const editarProyectoForm = document.getElementById('editarProyectoForm');
        
        if (editarProyectoBtn) {
            editarProyectoBtn.addEventListener('click', () => {
                this.mostrarModalEditarProyecto();
            });
        }
        
        if (cerrarEditarModal) {
            cerrarEditarModal.addEventListener('click', () => {
                this.ocultarModalEditarProyecto();
            });
        }
        
        if (editarProyectoModal) {
            editarProyectoModal.addEventListener('click', (e) => {
                if (e.target.id === 'editarProyectoModal') {
                    this.ocultarModalEditarProyecto();
                }
            });
        }
        
        if (editarProyectoForm) {
            editarProyectoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarCambiosProyecto();
            });
        }
    }

    cargarProyecto() {
        if (!this.proyectoId) {
            this.mostrarError('No se encontró el proyecto');
            return;
        }

        const proyectos = JSON.parse(localStorage.getItem('metaTrack_proyectos')) || [];
        this.proyecto = proyectos.find(p => p.id === this.proyectoId);

        if (!this.proyecto) {
            this.mostrarError('Proyecto no encontrado');
            return;
        }

        // Inicializar propiedades si no existen
        this.inicializarPropiedadesProyecto();
        this.renderizarProyecto();
    }

    inicializarPropiedadesProyecto() {
        // Asegurar que todas las propiedades existan
        const propiedades = {
            archivos: [],
            carpetas: [],
            bocetos: [],
            archivosCodigo: [],
            tareas: [],
            notas: '',
            progreso: 0,
            prioridad: 'media',
            categoria: '',
            presupuesto: 0,
            fechaCreacion: new Date().toISOString()
        };

        Object.keys(propiedades).forEach(prop => {
            if (this.proyecto[prop] === undefined) {
                this.proyecto[prop] = propiedades[prop];
            }
        });
    }

    renderizarProyecto() {
        // Información principal
        document.getElementById('proyectoNombreTitulo').textContent = this.proyecto.nombre;
        document.getElementById('proyectoEstadoBadge').textContent = this.obtenerTextoEstado(this.proyecto.estado);
        document.getElementById('proyectoEstadoBadge').className = `estado-badge estado-${this.proyecto.estado}`;
        
        document.getElementById('proyectoPrioridadBadge').textContent = this.obtenerTextoPrioridad(this.proyecto.prioridad);
        document.getElementById('proyectoPrioridadBadge').className = `prioridad-badge prioridad-${this.proyecto.prioridad}`;

        // Progreso
        document.getElementById('progresoPorcentaje').textContent = `${this.proyecto.progreso}%`;
        document.getElementById('progresoFill').style.width = `${this.proyecto.progreso}%`;

        // Información detallada
        document.getElementById('infoFechaCreacion').textContent = new Date(this.proyecto.fechaCreacion).toLocaleDateString('es-ES');
        document.getElementById('infoFechaLimite').textContent = this.proyecto.fechaLimite ? 
            new Date(this.proyecto.fechaLimite).toLocaleDateString('es-ES') : 'Sin fecha límite';
        
        document.getElementById('infoCategoria').textContent = this.proyecto.categoria || 'Sin categoría';
        document.getElementById('infoPrioridad').textContent = this.obtenerTextoPrioridad(this.proyecto.prioridad);
        document.getElementById('infoPresupuesto').textContent = this.proyecto.presupuesto ? 
            `$${this.proyecto.presupuesto.toLocaleString()}` : 'Sin presupuesto';
        
        document.getElementById('infoDescripcion').textContent = this.proyecto.descripcion || 'Sin descripción';

        // Renderizar secciones específicas
        this.renderizarArchivos();
        this.renderizarBocetos();
        this.renderizarCodigo();
        this.renderizarTareas();
        this.renderizarNotas();
    }

    cambiarSeccion(seccion) {
        // Ocultar todas las secciones
        document.querySelectorAll('.seccion-contenido').forEach(sec => {
            sec.classList.remove('active');
        });

        // Quitar active de todos los botones
        document.querySelectorAll('.seccion-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar sección seleccionada
        document.getElementById(`seccion-${seccion}`).classList.add('active');
        document.querySelector(`[data-seccion="${seccion}"]`).classList.add('active');
    }

    // ===== GESTIÓN DE ARCHIVOS =====
    mostrarModalCarpeta() {
        document.getElementById('carpetaModal').style.display = 'flex';
    }

    ocultarModalCarpeta() {
        document.getElementById('carpetaModal').style.display = 'none';
        document.getElementById('carpetaForm').reset();
    }

    crearCarpeta() {
        const nombre = document.getElementById('nombreCarpeta').value.trim();
        
        if (!nombre) {
            this.mostrarAlerta('El nombre de la carpeta es obligatorio', 'error');
            return;
        }

        const nuevaCarpeta = {
            id: this.generarId(),
            nombre: nombre,
            tipo: 'carpeta',
            fechaCreacion: new Date().toISOString(),
            archivos: []
        };

        this.proyecto.carpetas.push(nuevaCarpeta);
        this.guardarProyecto();
        this.renderizarArchivos();
        this.ocultarModalCarpeta();
        this.mostrarAlerta('Carpeta creada correctamente', 'success');
    }

    subirArchivos(archivos) {
        for (let archivo of archivos) {
            const nuevoArchivo = {
                id: this.generarId(),
                nombre: archivo.name,
                tipo: this.obtenerTipoArchivo(archivo.name),
                archivo: archivo,
                fechaSubida: new Date().toISOString(),
                tamaño: archivo.size
            };

            // Por simplicidad, guardamos en la carpeta raíz
            // En una implementación real, necesitarías manejar carpetas
            this.proyecto.archivos.push(nuevoArchivo);
        }

        this.guardarProyecto();
        this.renderizarArchivos();
        this.mostrarAlerta('Archivos subidos correctamente', 'success');
        
        // Limpiar input
        document.getElementById('fileInput').value = '';
    }

    obtenerTipoArchivo(nombre) {
        const extension = nombre.split('.').pop().toLowerCase();
        const tipos = {
            'jpg': 'imagen', 'jpeg': 'imagen', 'png': 'imagen', 'gif': 'imagen',
            'pdf': 'documento', 'doc': 'documento', 'docx': 'documento',
            'txt': 'texto', 'zip': 'archivo', 'rar': 'archivo'
        };
        return tipos[extension] || 'archivo';
    }

    renderizarArchivos() {
        const container = document.getElementById('archivosContainer');
        
        if (this.proyecto.archivos.length === 0 && this.proyecto.carpetas.length === 0) {
            container.innerHTML = `
                <div class="archivos-vacio">
                    <i class="fas fa-folder-open"></i>
                    <h4>No hay archivos aún</h4>
                    <p>Sube archivos o crea carpetas para organizar tu proyecto</p>
                </div>
            `;
            return;
        }

        let html = '';

        // Mostrar carpetas
        this.proyecto.carpetas.forEach(carpeta => {
            html += `
                <div class="archivo-item carpeta" data-id="${carpeta.id}">
                    <i class="fas fa-folder"></i>
                    <span class="archivo-nombre">${carpeta.nombre}</span>
                    <div class="archivo-acciones">
                        <button class="btn btn-icon btn-eliminar-archivo" title="Eliminar carpeta">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        // Mostrar archivos
        this.proyecto.archivos.forEach(archivo => {
            const icono = this.obtenerIconoArchivo(archivo.tipo);
            html += `
                <div class="archivo-item" data-id="${archivo.id}">
                    <i class="${icono}"></i>
                    <span class="archivo-nombre">${archivo.nombre}</span>
                    <div class="archivo-acciones">
                        <button class="btn btn-icon btn-descargar-archivo" title="Descargar">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-icon btn-eliminar-archivo" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Agregar eventos
        this.agregarEventosArchivos();
    }

    obtenerIconoArchivo(tipo) {
        const iconos = {
            'imagen': 'fas fa-file-image',
            'documento': 'fas fa-file-pdf',
            'texto': 'fas fa-file-alt',
            'archivo': 'fas fa-file-archive'
        };
        return iconos[tipo] || 'fas fa-file';
    }

    agregarEventosArchivos() {
        // Eliminar archivos
        document.querySelectorAll('.btn-eliminar-archivo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const archivoItem = e.target.closest('.archivo-item');
                const archivoId = archivoItem.dataset.id;
                this.eliminarArchivo(archivoId);
            });
        });

        // Descargar archivos
        document.querySelectorAll('.btn-descargar-archivo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const archivoItem = e.target.closest('.archivo-item');
                const archivoId = archivoItem.dataset.id;
                this.descargarArchivo(archivoId);
            });
        });
    }

    eliminarArchivo(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            this.proyecto.archivos = this.proyecto.archivos.filter(a => a.id !== id);
            this.proyecto.carpetas = this.proyecto.carpetas.filter(c => c.id !== id);
            this.guardarProyecto();
            this.renderizarArchivos();
            this.mostrarAlerta('Archivo eliminado correctamente', 'success');
        }
    }

    descargarArchivo(id) {
        const archivo = this.proyecto.archivos.find(a => a.id === id);
        if (archivo && archivo.archivo) {
            const url = URL.createObjectURL(archivo.archivo);
            const a = document.createElement('a');
            a.href = url;
            a.download = archivo.nombre;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // ===== GESTIÓN DE BOCETOS =====
    subirBocetos(archivos) {
        for (let archivo of archivos) {
            if (archivo.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const nuevoBoceto = {
                        id: this.generarId(),
                        nombre: archivo.name,
                        imagen: e.target.result,
                        fechaCreacion: new Date().toISOString()
                    };

                    this.proyecto.bocetos.push(nuevoBoceto);
                    this.guardarProyecto();
                    this.renderizarBocetos();
                };
                reader.readAsDataURL(archivo);
            }
        }
        this.mostrarAlerta('Bocetos subidos correctamente', 'success');
        document.getElementById('bocetoInput').value = '';
    }

    crearNuevoBoceto() {
        const nuevoBoceto = {
            id: this.generarId(),
            nombre: `Boceto-${new Date().getTime()}`,
            imagen: this.crearLienzoBlanco(),
            fechaCreacion: new Date().toISOString()
        };

        this.proyecto.bocetos.push(nuevoBoceto);
        this.guardarProyecto();
        this.renderizarBocetos();
        this.mostrarAlerta('Nuevo boceto creado', 'success');
    }

    crearLienzoBlanco() {
        // Crear un canvas simple (en una implementación real sería más complejo)
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 300);
        return canvas.toDataURL();
    }

    renderizarBocetos() {
        const container = document.getElementById('bocetosGrid');
        
        if (this.proyecto.bocetos.length === 0) {
            container.innerHTML = `
                <div class="bocetos-vacio">
                    <i class="fas fa-palette"></i>
                    <h4>No hay bocetos aún</h4>
                    <p>Crea tu primer boceto o sube una imagen</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.proyecto.bocetos.map(boceto => `
            <div class="boceto-card" data-id="${boceto.id}">
                <img src="${boceto.imagen}" alt="${boceto.nombre}">
                <div class="boceto-info">
                    <span class="boceto-nombre">${boceto.nombre}</span>
                    <div class="boceto-acciones">
                        <button class="btn btn-icon btn-eliminar-boceto" title="Eliminar boceto">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Agregar eventos
        document.querySelectorAll('.btn-eliminar-boceto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bocetoCard = e.target.closest('.boceto-card');
                const bocetoId = bocetoCard.dataset.id;
                this.eliminarBoceto(bocetoId);
            });
        });
    }

    eliminarBoceto(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este boceto?')) {
            this.proyecto.bocetos = this.proyecto.bocetos.filter(b => b.id !== id);
            this.guardarProyecto();
            this.renderizarBocetos();
            this.mostrarAlerta('Boceto eliminado correctamente', 'success');
        }
    }

    // ===== GESTIÓN DE CÓDIGO =====
    crearNuevoArchivoCodigo() {
        const nombre = prompt('Nombre del archivo (con extensión):', 'nuevo-archivo.js');
        if (!nombre) return;

        const nuevoArchivo = {
            id: this.generarId(),
            nombre: nombre,
            contenido: '',
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString()
        };

        this.proyecto.archivosCodigo.push(nuevoArchivo);
        this.guardarProyecto();
        this.renderizarCodigo();
        this.mostrarAlerta('Archivo de código creado', 'success');
    }

    renderizarCodigo() {
        const container = document.getElementById('codigoArchivos');
        
        container.innerHTML = this.proyecto.archivosCodigo.map(archivo => `
            <div class="archivo-codigo-item ${this.archivoEditando?.id === archivo.id ? 'active' : ''}" 
                 data-id="${archivo.id}">
                <i class="fas fa-file-code"></i>
                <span class="archivo-codigo-nombre">${archivo.nombre}</span>
                <div class="archivo-codigo-acciones">
                    <button class="btn btn-icon btn-eliminar-codigo" title="Eliminar archivo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Agregar eventos
        document.querySelectorAll('.archivo-codigo-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-eliminar-codigo')) {
                    const archivoId = item.dataset.id;
                    this.abrirArchivoCodigo(archivoId);
                }
            });
        });

        document.querySelectorAll('.btn-eliminar-codigo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const archivoItem = e.target.closest('.archivo-codigo-item');
                const archivoId = archivoItem.dataset.id;
                this.eliminarArchivoCodigo(archivoId);
            });
        });
    }

    abrirArchivoCodigo(id) {
        const archivo = this.proyecto.archivosCodigo.find(a => a.id === id);
        if (archivo) {
            this.archivoEditando = archivo;
            document.getElementById('editorNombreArchivo').textContent = archivo.nombre;
            document.getElementById('editorCodigo').value = archivo.contenido;
            this.renderizarCodigo();
        }
    }

    guardarArchivoCodigo() {
        if (!this.archivoEditando) {
            this.mostrarAlerta('No hay archivo seleccionado', 'error');
            return;
        }

        const contenido = document.getElementById('editorCodigo').value;
        this.archivoEditando.contenido = contenido;
        this.archivoEditando.fechaModificacion = new Date().toISOString();

        this.guardarProyecto();
        this.mostrarAlerta('Archivo guardado correctamente', 'success');
    }

    eliminarArchivoCodigo(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este archivo de código?')) {
            this.proyecto.archivosCodigo = this.proyecto.archivosCodigo.filter(a => a.id !== id);
            if (this.archivoEditando?.id === id) {
                this.archivoEditando = null;
                document.getElementById('editorNombreArchivo').textContent = 'Selecciona un archivo';
                document.getElementById('editorCodigo').value = '';
            }
            this.guardarProyecto();
            this.renderizarCodigo();
            this.mostrarAlerta('Archivo eliminado correctamente', 'success');
        }
    }

    // ===== GESTIÓN DE TAREAS =====
    crearNuevaTarea() {
        const titulo = prompt('Título de la tarea:');
        if (!titulo) return;

        const nuevaTarea = {
            id: this.generarId(),
            titulo: titulo,
            completada: false,
            fechaCreacion: new Date().toISOString()
        };

        this.proyecto.tareas.push(nuevaTarea);
        this.guardarProyecto();
        this.renderizarTareas();
        this.mostrarAlerta('Tarea creada', 'success');
    }

    renderizarTareas() {
        const container = document.getElementById('tareasContainer');
        
        if (this.proyecto.tareas.length === 0) {
            container.innerHTML = `
                <div class="tareas-vacio">
                    <i class="fas fa-tasks"></i>
                    <h4>No hay tareas aún</h4>
                    <p>Crea tu primera tarea para este proyecto</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.proyecto.tareas.map(tarea => `
            <div class="tarea-item ${tarea.completada ? 'completada' : ''}" data-id="${tarea.id}">
                <label class="tarea-checkbox">
                    <input type="checkbox" ${tarea.completada ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="tarea-titulo">${tarea.titulo}</span>
                <div class="tarea-acciones">
                    <button class="btn btn-icon btn-eliminar-tarea" title="Eliminar tarea">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Agregar eventos
        document.querySelectorAll('.tarea-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = tareaItem.dataset.id;
                this.toggleTarea(tareaId);
            });
        });

        document.querySelectorAll('.btn-eliminar-tarea').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = tareaItem.dataset.id;
                this.eliminarTarea(tareaId);
            });
        });
    }

    toggleTarea(id) {
        const tarea = this.proyecto.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = !tarea.completada;
            this.actualizarProgreso();
            this.guardarProyecto();
            this.renderizarTareas();
        }
    }

    eliminarTarea(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            this.proyecto.tareas = this.proyecto.tareas.filter(t => t.id !== id);
            this.actualizarProgreso();
            this.guardarProyecto();
            this.renderizarTareas();
            this.mostrarAlerta('Tarea eliminada', 'success');
        }
    }

    actualizarProgreso() {
        const totalTareas = this.proyecto.tareas.length;
        if (totalTareas === 0) {
            this.proyecto.progreso = 0;
            return;
        }

        const tareasCompletadas = this.proyecto.tareas.filter(t => t.completada).length;
        this.proyecto.progreso = Math.round((tareasCompletadas / totalTareas) * 100);
    }

    // ===== GESTIÓN DE NOTAS =====
    renderizarNotas() {
        document.getElementById('editorNotas').value = this.proyecto.notas || '';
    }

    guardarNotas() {
        this.proyecto.notas = document.getElementById('editorNotas').value;
        this.guardarProyecto();
        this.mostrarAlerta('Notas guardadas correctamente', 'success');
    }

    // ===== UTILIDADES =====
    guardarProyecto() {
        const proyectos = JSON.parse(localStorage.getItem('metaTrack_proyectos')) || [];
        const index = proyectos.findIndex(p => p.id === this.proyecto.id);
        
        if (index !== -1) {
            proyectos[index] = this.proyecto;
        } else {
            proyectos.push(this.proyecto);
        }
        
        localStorage.setItem('metaTrack_proyectos', JSON.stringify(proyectos));

        // Actualizar UI
        this.renderizarProyecto();
    }

    // ===== GESTIÓN DE EDICIÓN DE PROYECTO =====
    mostrarModalEditarProyecto() {
        // Llenar el formulario con los datos actuales
        this.llenarFormularioEdicion();
        document.getElementById('editarProyectoModal').style.display = 'flex';
    }

    ocultarModalEditarProyecto() {
        document.getElementById('editarProyectoModal').style.display = 'none';
    }

    llenarFormularioEdicion() {
        // Llenar todos los campos del formulario con los datos actuales del proyecto
        const form = document.getElementById('editarProyectoForm');
        if (!form) return;

        // Llenar campos básicos
        if (form.querySelector('[name="nombre"]')) {
            form.querySelector('[name="nombre"]').value = this.proyecto.nombre || '';
        }
        
        if (form.querySelector('[name="descripcion"]')) {
            form.querySelector('[name="descripcion"]').value = this.proyecto.descripcion || '';
        }
        
        if (form.querySelector('[name="presupuesto"]')) {
            form.querySelector('[name="presupuesto"]').value = this.proyecto.presupuesto || '';
        }
        
        if (form.querySelector('[name="clasificacion"]')) {
            form.querySelector('[name="clasificacion"]').value = this.proyecto.clasificacion || '';
        }
        
        // Llenar fechas
        if (form.querySelector('[name="fechaInicio"]')) {
            form.querySelector('[name="fechaInicio"]').value = this.proyecto.fechaInicio || '';
        }
        
        if (form.querySelector('[name="fechaFin"]')) {
            form.querySelector('[name="fechaFin"]').value = this.proyecto.fechaFin || '';
        }
        
        // Llenar estado
        if (form.querySelector('[name="estado"]')) {
            form.querySelector('[name="estado"]').value = this.proyecto.estado || 'pendiente';
        }
    }

    guardarCambiosProyecto() {
        const form = document.getElementById('editarProyectoForm');
        if (!form) return;

        // Obtener valores del formulario
        const formData = new FormData(form);
        
        // Actualizar proyecto con los nuevos valores
        this.proyecto.nombre = formData.get('nombre') || this.proyecto.nombre;
        this.proyecto.descripcion = formData.get('descripcion') || this.proyecto.descripcion;
        this.proyecto.presupuesto = formData.get('presupuesto') || this.proyecto.presupuesto;
        this.proyecto.clasificacion = formData.get('clasificacion') || this.proyecto.clasificacion;
        this.proyecto.fechaInicio = formData.get('fechaInicio') || this.proyecto.fechaInicio;
        this.proyecto.fechaFin = formData.get('fechaFin') || this.proyecto.fechaFin;
        this.proyecto.estado = formData.get('estado') || this.proyecto.estado;

        // Guardar cambios
        this.guardarProyecto();
        this.renderizarProyecto();
        this.mostrarAlerta('Proyecto actualizado correctamente', 'success');
        
        this.ocultarModalEditarProyecto();
    }

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    obtenerTextoEstado(estado) {
        const estados = {
            'activo': 'Activo',
            'pausado': 'Pausado',
            'completado': 'Completado'
        };
        return estados[estado] || estado;
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

    mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        alerta.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background-color: ${tipo === 'success' ? '#10b981' : '#ef4444'};
        `;
        alerta.textContent = mensaje;

        document.body.appendChild(alerta);

        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

    mostrarError(mensaje) {
        this.mostrarAlerta(mensaje, 'error');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new GestorDetalleProyecto();
});