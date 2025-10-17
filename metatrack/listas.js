class Proyecto {
    constructor(id, nombre, descripcion, estado, fechaLimite, fechaCreacion = new Date(), 
                prioridad = 'media', categoria = '', presupuesto = 0, etiquetas = [], progreso = 0,
                archivos = [], carpetas = [], bocetos = [], archivosCodigo = [], tareas = [], notas = [], repositorios = [], infoAdicional = '') {
        // Propiedades básicas
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.estado = estado;
        
        // Fechas
        this.fechaLimite = fechaLimite;
        this.fechaCreacion = fechaCreacion;
        
        // Metadatos
        this.prioridad = prioridad;
        this.categoria = categoria;
        this.presupuesto = presupuesto;
        this.etiquetas = etiquetas;
        this.progreso = progreso;
        
        // Contenido
        this.archivos = archivos;
        this.carpetas = carpetas;
        this.bocetos = bocetos;
        this.archivosCodigo = archivosCodigo;
        this.tareas = tareas; // array de objetos {id,name,completed,date}
        this.notas = notas;   // array de objetos {id,title,content,date}
        this.repositorios = repositorios; // array de strings "owner/repo"
        this.infoAdicional = infoAdicional; // string
    }
}

/**
 * Gestor de proyectos - Controlador principal
 */
class GestorProyectos {
    constructor() {
        this.proyectos = this.cargarProyectos();
        this.proyectoEditando = null;
        this.inicializarEventos();
        this.renderizarProyectos();
    }

    /**
     * Carga proyectos desde localStorage
     * @returns {Array} Array de proyectos
     */
    cargarProyectos() {
        const proyectosGuardados = localStorage.getItem('metaTrack_proyectos');
        return proyectosGuardados ? JSON.parse(proyectosGuardados) : [];
    }

    /**
     * Guarda proyectos en localStorage
     */
    guardarProyectos() {
        localStorage.setItem('metaTrack_proyectos', JSON.stringify(this.proyectos));
    }

    /**
     * Genera ID único para proyectos
     * @returns {String} ID único
     */
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * Inicializa todos los eventos de la interfaz
     */
    inicializarEventos() {
        // Obtener referencias a elementos DOM (mejora rendimiento)
        const btnCrearProyecto = document.getElementById('crearProyectoBtn');
        const btnCerrarModal = document.getElementById('cerrarModal');
        const btnCancelarProyecto = document.getElementById('cancelarProyecto');
        const formProyecto = document.getElementById('proyectoForm');
        const inputBuscar = document.getElementById('buscarProyecto');
        const selectFiltroEstado = document.getElementById('filtroEstado');
        const modalProyecto = document.getElementById('proyectoModal');
        
        // Eventos de creación y edición
        if (btnCrearProyecto) {
            btnCrearProyecto.addEventListener('click', (e) => { 
                e.preventDefault();
                this.mostrarModal();
            });
        }
        
        // Eventos de cierre de modal
        if (btnCerrarModal) {
            btnCerrarModal.addEventListener('click', () => this.ocultarModal());
        }
        
        if (btnCancelarProyecto) {
            btnCancelarProyecto.addEventListener('click', () => this.ocultarModal());
        }
        
        // Evento de guardado
        if (formProyecto) {
            formProyecto.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarProyecto();
            });
        }
        
        // Eventos de filtrado
        if (inputBuscar) {
            inputBuscar.addEventListener('input', () => this.filtrarProyectos());
        }
        
        if (selectFiltroEstado) {
            selectFiltroEstado.addEventListener('change', () => this.filtrarProyectos());
        }
        
        // Cierre de modal al hacer clic fuera
        if (modalProyecto) {
            modalProyecto.addEventListener('click', (e) => {
                if (e.target.id === 'proyectoModal') {
                    this.ocultarModal();
                }
            });
        }

        // Inicializar campos adicionales del formulario
        this.inicializarFormulario();
    }

    // Mostrar modal
    mostrarModal(proyecto = null) {
        const modal = document.getElementById('proyectoModal');
        const titulo = document.getElementById('modalTitulo');
        const form = document.getElementById('proyectoForm');
        if (!modal) {
            console.warn('Modal de proyecto no encontrado en el DOM');
            return;
        }

        if (proyecto) {
            titulo.textContent = 'Editar Proyecto';
            this.proyectoEditando = proyecto;
            this.llenarFormulario(proyecto);
        } else {
            titulo.textContent = 'Nuevo Proyecto';
            this.proyectoEditando = null;
            form.reset();
            if (document.getElementById('proyectoEstado')) document.getElementById('proyectoEstado').value = 'activo';
            if (document.getElementById('proyectoPrioridad')) document.getElementById('proyectoPrioridad').value = 'media';
        }

        modal.classList.add('show');
        // intento de foco con pequeño delay para cuando el modal está visible
        setTimeout(() => {
            const nombreEl = document.getElementById('proyectoNombre');
            if (nombreEl) nombreEl.focus();
        }, 50);
    }

    // Ocultar modal
    ocultarModal() {
        const modal = document.getElementById('proyectoModal');
        if (modal) modal.classList.remove('show');
        this.proyectoEditando = null;
        const form = document.getElementById('proyectoForm');
        if (form) form.reset();
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

        // --- NUEVO: Inyectar UI dinámica para tareas, notas, repos, archivos e info adicional ---
        const extrasContainer = document.getElementById('proyectoExtras');
        if (extrasContainer && !extrasContainer.dataset.initialized) {
            extrasContainer.innerHTML = `
                <div class="form-group">
                    <label>Tareas</label>
                    <div id="tareasList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px;"></div>
                    <button type="button" id="addTareaBtn" class="btn">Agregar Tarea</button>
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <div id="notasList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px;"></div>
                    <button type="button" id="addNotaBtn" class="btn">Agregar Nota</button>
                </div>
                <div class="form-group">
                    <label>Repositorios (owner/repo)</label>
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
                        <input type="text" id="repoInput" placeholder="ej: facebook/react" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ccc;">
                        <button type="button" id="addRepoBtn" class="btn">Agregar</button>
                    </div>
                    <div id="reposList" style="display:flex;flex-direction:column;gap:6px;"></div>
                </div>
                <div class="form-group">
                    <label>Archivos (simulado)</label>
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
                        <input type="text" id="archivoInput" placeholder="nombre-de-archivo.ext" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ccc;">
                        <button type="button" id="addArchivoBtn" class="btn">Agregar</button>
                    </div>
                    <div id="archivosList" style="display:flex;flex-direction:column;gap:6px;"></div>
                </div>
                <div class="form-group">
                    <label>Información Adicional</label>
                    <textarea id="infoAdicional" rows="3" placeholder="Detalles extra del proyecto..."></textarea>
                </div>
            `;
            // marcar inicializado para no duplicar
            extrasContainer.dataset.initialized = '1';

            // enlazar botones
            document.getElementById('addTareaBtn').addEventListener('click', () => this._addTareaField());
            document.getElementById('addNotaBtn').addEventListener('click', () => this._addNotaField());
            document.getElementById('addRepoBtn').addEventListener('click', () => this._addRepoFromInput());
            document.getElementById('addArchivoBtn').addEventListener('click', () => this._addArchivoFromInput());
        }
    }

    // Añade una fila para tarea en el modal
    _addTareaField(value = '') {
        const cont = document.getElementById('tareasList');
        if (!cont) return;
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const row = document.createElement('div');
        row.className = 'tarea-item';
        row.dataset.id = id;
        row.innerHTML = `
            <div style="display:flex;gap:8px;align-items:center;">
                <input type="text" class="tarea-name" placeholder="Nombre de tarea" value="${this.escapeHTML(value)}" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ccc;">
                <button type="button" class="btn btn-danger btn-remove-tarea">Eliminar</button>
            </div>
        `;
        cont.appendChild(row);
        row.querySelector('.btn-remove-tarea').addEventListener('click', () => row.remove());
    }

    // Añade una fila para nota en el modal
    _addNotaField(data = null) {
        const cont = document.getElementById('notasList');
        if (!cont) return;
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const row = document.createElement('div');
        row.className = 'nota-item';
        row.dataset.id = id;
        row.innerHTML = `
            <input type="text" class="nota-title" placeholder="Título de la nota" value="${this.escapeHTML(data ? data.title : '')}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;margin-bottom:6px;">
            <textarea class="nota-content" placeholder="Contenido" rows="2" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
            <div style="text-align:right;margin-top:6px;">
                <button type="button" class="btn btn-danger btn-remove-nota">Eliminar</button>
            </div>
        `;
        cont.appendChild(row);
        if (data && data.content) row.querySelector('.nota-content').value = data.content;
        row.querySelector('.btn-remove-nota').addEventListener('click', () => row.remove());
    }

    _addRepoFromInput() {
        const input = document.getElementById('repoInput');
        if (!input) return;
        const val = (input.value || '').trim();
        if (!val) return alert('Introduce owner/repo válido');
        const list = document.getElementById('reposList');
        const item = document.createElement('div');
        item.className = 'repo-item';
        item.innerHTML = `<span style="flex:1">${this.escapeHTML(val)}</span> <button type="button" class="btn btn-danger btn-remove-repo">Eliminar</button>`;
        item.style.display = 'flex';
        item.style.gap = '8px';
        item.style.alignItems = 'center';
        list.appendChild(item);
        item.querySelector('.btn-remove-repo').addEventListener('click', () => item.remove());
        input.value = '';
    }

    _addArchivoFromInput() {
        const input = document.getElementById('archivoInput');
        if (!input) return;
        const val = (input.value || '').trim();
        if (!val) return alert('Introduce nombre de archivo');
        const list = document.getElementById('archivosList');
        const item = document.createElement('div');
        item.className = 'archivo-item';
        item.innerHTML = `<span style="flex:1">${this.escapeHTML(val)}</span> <button type="button" class="btn btn-danger btn-remove-archivo">Eliminar</button>`;
        item.style.display = 'flex';
        item.style.gap = '8px';
        item.style.alignItems = 'center';
        list.appendChild(item);
        item.querySelector('.btn-remove-archivo').addEventListener('click', () => item.remove());
        input.value = '';
    }

    // --- modificar llenarFormulario para popular tareas/notas/repos/archivos/infoAdicional ---
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

        // Asegurar que UI extras está creada
        this.inicializarFormulario();

        // Limpiar listas actuales en modal
        const tareasList = document.getElementById('tareasList');
        const notasList = document.getElementById('notasList');
        const reposList = document.getElementById('reposList');
        const archivosList = document.getElementById('archivosList');
        if (tareasList) tareasList.innerHTML = '';
        if (notasList) notasList.innerHTML = '';
        if (reposList) reposList.innerHTML = '';
        if (archivosList) archivosList.innerHTML = '';

        // Popular tareas
        if (proyecto.tareas && proyecto.tareas.length) {
            proyecto.tareas.forEach(t => this._addTareaField(t.name || ''));
        }

        // Popular notas
        if (proyecto.notas && proyecto.notas.length) {
            proyecto.notas.forEach(n => this._addNotaField(n));
        }

        // Popular repositorios
        if (proyecto.repositorios && proyecto.repositorios.length) {
            proyecto.repositorios.forEach(r => {
                const item = document.createElement('div');
                item.className = 'repo-item';
                item.innerHTML = `<span style="flex:1">${this.escapeHTML(r)}</span> <button type="button" class="btn btn-danger btn-remove-repo">Eliminar</button>`;
                item.style.display = 'flex';
                item.style.gap = '8px';
                item.style.alignItems = 'center';
                reposList.appendChild(item);
                item.querySelector('.btn-remove-repo').addEventListener('click', () => item.remove());
            });
        }

        // Popular archivos
        if (proyecto.archivos && proyecto.archivos.length) {
            proyecto.archivos.forEach(a => {
                const item = document.createElement('div');
                item.className = 'archivo-item';
                item.innerHTML = `<span style="flex:1">${this.escapeHTML(a.name || a)}</span> <button type="button" class="btn btn-danger btn-remove-archivo">Eliminar</button>`;
                item.style.display = 'flex';
                item.style.gap = '8px';
                item.style.alignItems = 'center';
                archivosList.appendChild(item);
                item.querySelector('.btn-remove-archivo').addEventListener('click', () => item.remove());
            });
        }

        // Info adicional
        const infoEl = document.getElementById('infoAdicional');
        if (infoEl) infoEl.value = proyecto.infoAdicional || '';
    }

    // Guardar proyecto (crear o editar) -> leer listas del modal y guardarlas en el objeto
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

        // Recoger tareas desde el modal
        const tareas = [];
        document.querySelectorAll('#tareasList .tarea-item').forEach(el => {
            const name = el.querySelector('.tarea-name') ? el.querySelector('.tarea-name').value.trim() : '';
            if (name) tareas.push({ id: el.dataset.id || (Date.now().toString(36)), name: name, completed: false, date: '' });
        });

        // Recoger notas
        const notas = [];
        document.querySelectorAll('#notasList .nota-item').forEach(el => {
            const title = el.querySelector('.nota-title') ? el.querySelector('.nota-title').value.trim() : '';
            const content = el.querySelector('.nota-content') ? el.querySelector('.nota-content').value.trim() : '';
            if (title || content) notas.push({ id: el.dataset.id || (Date.now().toString(36)), title: title || '(sin título)', content: content || '', date: new Date().toLocaleString() });
        });

        // Repositorios
        const repos = [];
        document.querySelectorAll('#reposList .repo-item').forEach(el => {
            const txt = el.querySelector('span') ? el.querySelector('span').textContent.trim() : '';
            if (txt) repos.push(txt);
        });

        // Archivos (simulados)
        const archivos = [];
        document.querySelectorAll('#archivosList .archivo-item').forEach(el => {
            const txt = el.querySelector('span') ? el.querySelector('span').textContent.trim() : '';
            if (txt) archivos.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: txt, uploadedAt: new Date().toLocaleString() });
        });

        // Info adicional
        const infoAdicional = (document.getElementById('infoAdicional') ? document.getElementById('infoAdicional').value.trim() : '') || '';

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

            // actualizar colecciones
            proyecto.tareas = tareas;
            proyecto.notas = notas;
            proyecto.repositorios = repos;
            // preservar archivos existentes y añadir los nuevos simulados
            proyecto.archivos = (proyecto.archivos || []).concat(archivos);
            proyecto.infoAdicional = infoAdicional;
        } else {
            // Crear nuevo proyecto con colecciones completas
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
                etiquetas,
                0, /* progreso */
                archivos, /* archivos */
                [], /* carpetas */
                [], /* bocetos */
                [], /* archivosCodigo */
                tareas,
                notas,
                repos,
                infoAdicional
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
                e.stopPropagation();
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
                e.stopPropagation(); 
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