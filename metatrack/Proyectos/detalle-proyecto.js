document.addEventListener('DOMContentLoaded', function() {
    // Navegación entre secciones
    const menuItems = document.querySelectorAll('.menu a');
    const sections = document.querySelectorAll('.section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los elementos
            menuItems.forEach(menuItem => {
                menuItem.parentElement.classList.remove('active');
            });
            
            // Agregar clase active al elemento clickeado
            this.parentElement.classList.add('active');
            
            // Mostrar la sección correspondiente
            const targetId = this.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Funcionalidad del botón de retroceso
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    // Funcionalidad del botón de editar proyecto
    const editButton = document.querySelector('.edit-button');
    if (editButton) {
        editButton.addEventListener('click', function() {
            alert('Función de editar proyecto');
            // Aquí se implementaría la funcionalidad para editar el proyecto
        });
    }
    
    // Obtener projectId desde la URL
    const projectId = getProjectIdFromURL();
    if (!projectId) {
        console.warn('No project id in URL');
        loadSectionData(); // cae en modo demo
        return;
    }
    
    // Cargar proyecto desde storage
    const project = loadProject(projectId);
    if (!project) {
        console.warn('Proyecto no encontrado:', projectId);
        loadSectionData();
        return;
    }
    
    // Guardar referencia global simple
    window.currentProject = project;
    window.currentProjectId = projectId;
    
    // Renderizar valores dinámicos (presupuesto, archivos, tareas, notas)
    renderBudgetInfo();
    loadSectionData(); // carga las secciones dinámicas usando window.currentProject
    
    // Reemplazar handlers simples por handlers funcionales
    const btnMovimientos = document.querySelector('.btn-movimientos');
    if (btnMovimientos) {
        btnMovimientos.removeEventListener && btnMovimientos.removeEventListener('click', ()=>{});
        btnMovimientos.addEventListener('click', openAddMovementDialog);
    }
    
    // addSectionButtonEvents será llamado desde loadSectionData y asignará los demás handlers
});

// Funciones de storage y utilidades nuevas
function getProjectIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function loadAllProjects() {
    try {
        const raw = localStorage.getItem('metaTrack_proyectos');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveAllProjects(projects) {
    localStorage.setItem('metaTrack_proyectos', JSON.stringify(projects));
}

function loadProject(id) {
    const projects = loadAllProjects();
    return projects.find(p => p.id === id) || null;
}

function saveProject(project) {
    const projects = loadAllProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.push(project);
    saveAllProjects(projects);
}

// Reutilizar loadSectionData existente pero ahora usa datos reales del proyecto
function loadSectionData() {
    const project = window.currentProject || {};
    
    // Actualizar contenido de presupuesto según project.movimientos y project.presupuesto
    renderBudgetInfo();
    
    // Archivos del proyecto (leer project.archivos)
    const filesContent = document.querySelector('.files-content');
    const archivos = project.archivos || [];
    filesContent.innerHTML = `
        <div class="file-list">
            ${archivos.map(a => `
                <div class="file-item">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${escapeHTML(a.name)}</span>
                    <span class="file-actions">
                        <button data-name="${escapeHTML(a.name)}" class="file-view-btn">Ver</button>
                        <button data-name="${escapeHTML(a.name)}" class="file-download-btn">Descargar</button>
                    </span>
                </div>
            `).join('')}
        </div>
        <button class="add-file-btn">Agregar Archivo</button>
    `;
    
    // Código del proyecto (ahora con selector de repositorio y visor)
    document.querySelector('.code-content').innerHTML = `
        <div class="code-repositories">
            <div class="repo-controls" style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
                <input type="text" class="repo-input" placeholder="owner/repo (ej: facebook/react)" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ccc;">
                <button class="repo-load-btn btn" style="padding:8px 12px;border-radius:6px;">Cargar</button>
                <button class="repo-save-btn btn" title="Guardar referencia al proyecto" style="padding:8px 12px;border-radius:6px;display:none;">Guardar en Proyecto</button>
            </div>
            <div class="repo-list" style="display:flex;gap:16px;">
                <div class="repo-tree" style="width:40%; max-height:420px; overflow:auto; border:1px solid #eee; padding:8px; border-radius:6px;">
                    <p class="repo-placeholder" style="color:#666;margin:0;">Introduce owner/repo y pulsa "Cargar" para explorar</p>
                </div>
                <div class="repo-viewer" style="flex:1; max-height:420px; overflow:auto;">
                    <div class="repo-file-info" style="margin-bottom:8px;color:#444;"></div>
                    <pre class="repo-file-content" style="white-space:pre-wrap; background:#fafafa; padding:12px; border-radius:6px; border:1px solid #eee; min-height:180px; overflow:auto;"></pre>
                </div>
            </div>
        </div>
    `;
    
    // Tareas del proyecto
    const tareas = project.tareas || [];
    document.querySelector('.tasks-content').innerHTML = `
        <div class="task-list">
            ${tareas.map(t => `
                <div class="task-item ${t.completed ? 'completed' : 'pending'}" data-id="${t.id}">
                    <input type="checkbox" ${t.completed ? 'checked' : ''}>
                    <span class="task-name">${escapeHTML(t.name)}</span>
                    <span class="task-date">${t.date || ''}</span>
                </div>
            `).join('')}
        </div>
        <button class="add-task-btn">Agregar Tarea</button>
    `;
    
    // Notas del proyecto
    const notas = project.notas || [];
    document.querySelector('.notes-content').innerHTML = `
        <div class="notes-list">
            ${notas.map(n => `
                <div class="note-item" data-id="${n.id}">
                    <h3>${escapeHTML(n.title)}</h3>
                    <p>${escapeHTML(n.content)}</p>
                    <span class="note-date">${n.date}</span>
                </div>
            `).join('')}
        </div>
        <button class="add-note-btn">Agregar Nota</button>
    `;
    
    // Agregar eventos a los botones de cada sección
    addSectionButtonEvents();
    
    // Delegación simple para ver/descargar archivos (simulado)
    document.querySelectorAll('.file-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('Vista previa simulada: ' + btn.dataset.name);
        });
    });
    document.querySelectorAll('.file-download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('Descarga simulada: ' + btn.dataset.name);
        });
    });

    // --- Nuevos handlers: explorar repositorio GitHub ---
    const repoInput = document.querySelector('.repo-input');
    const repoLoadBtn = document.querySelector('.repo-load-btn');
    const repoTree = document.querySelector('.repo-tree');
    const repoViewer = document.querySelector('.repo-file-content');
    const repoFileInfo = document.querySelector('.repo-file-info');
    const repoSaveBtn = document.querySelector('.repo-save-btn');

    // Si el proyecto ya tiene repos guardados, mostrar el primero en input
    if (project.repositorios && project.repositorios.length) {
        repoInput.value = project.repositorios[0];
        repoSaveBtn.style.display = 'inline-block';
    }

    if (repoLoadBtn) {
        repoLoadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const val = (repoInput.value || '').trim();
            if (!val || !val.includes('/')) return alert('Formato inválido. Usa owner/repo');
            repoTree.innerHTML = `<p style="color:#666;margin:0;">Cargando ${escapeHTML(val)}...</p>`;
            try {
                await loadRepoAndRender(val, '');
                repoSaveBtn.style.display = 'inline-block';
            } catch (err) {
                repoTree.innerHTML = `<p style="color:#c00;margin:0;">Error cargando repositorio: ${escapeHTML(err.message || String(err))}</p>`;
            }
        });
    }

    // Delegación: click en árbol (carpeta o archivo)
    repoTree.addEventListener('click', async (ev) => {
        const el = ev.target.closest('.repo-entry');
        if (!el) return;
        ev.stopPropagation();
        const path = el.dataset.path || '';
        const type = el.dataset.type;
        const repoFull = el.dataset.repo;
        if (type === 'dir') {
            // expandir/cargar carpeta
            const container = el.querySelector('.children');
            const isLoaded = el.dataset.loaded === '1';
            if (isLoaded) {
                // toggle visibility
                if (container) container.style.display = container.style.display === 'none' ? '' : 'none';
            } else {
                // cargar contenidos
                const placeholder = document.createElement('div');
                placeholder.textContent = 'Cargando...';
                placeholder.style.color = '#666';
                placeholder.style.fontSize = '13px';
                if (container) container.appendChild(placeholder);
                try {
                    const entries = await fetchGitHubRepoContents(repoFull, path);
                    renderRepoEntries(entries, container || el, repoFull);
                    el.dataset.loaded = '1';
                } catch (err) {
                    if (container) container.textContent = 'Error al cargar carpeta';
                }
            }
        } else if (type === 'file') {
            // ver archivo
            repoFileInfo.textContent = `Archivo: ${path} — cargando...`;
            repoViewer.textContent = '';
            try {
                await viewGitHubFile(repoFull, path);
            } catch (err) {
                repoFileInfo.textContent = `Error: ${err.message}`;
                repoViewer.textContent = '';
            }
        }
    });

    // Guardar referencia del repo en el proyecto
    if (repoSaveBtn) {
        repoSaveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = (repoInput.value || '').trim();
            if (!val) return alert('Introduce owner/repo antes de guardar');
            if (!window.currentProject) return alert('Proyecto no cargado');
            window.currentProject.repositorios = window.currentProject.repositorios || [];
            if (!window.currentProject.repositorios.includes(val)) {
                window.currentProject.repositorios.unshift(val);
                saveProject(window.currentProject);
                alert('Repositorio guardado en el proyecto');
            } else {
                alert('Repositorio ya guardado');
            }
        });
    }

}

// --- Nuevas funciones para GitHub ---
// Obtener listado de contenidos de la API GitHub
async function fetchGitHubRepoContents(repoFull, path = '') {
    const apiUrl = `https://api.github.com/repos/${repoFull}/contents/${path}`;
    const res = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (res.status === 404) throw new Error('Repositorio o ruta no encontrada');
    if (!res.ok) {
        const txt = await res.text().catch(()=>res.statusText);
        throw new Error('GitHub API error: ' + (txt || res.statusText));
    }
    return await res.json();
}

// Renderizar entradas (lista) dentro de un contenedor
function renderRepoEntries(entries, container, repoFull) {
    // entries puede ser objeto (archivo) o array
    if (!Array.isArray(entries)) {
        entries = [entries];
    }
    // ordenar (dirs primero)
    entries.sort((a,b)=>{
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });

    const html = entries.map(ent => {
        const icon = ent.type === 'dir' ? '📁' : '📄';
        const safeName = escapeHTML(ent.name);
        const safePath = escapeHTML(ent.path || ent.name);
        return `<div class="repo-entry" data-repo="${escapeHTML(repoFull)}" data-path="${safePath}" data-type="${ent.type}" style="padding:4px 6px;border-radius:4px;cursor:pointer;">
                    <span class="repo-entry-label">${icon} ${safeName}</span>
                    ${ent.type === 'dir' ? `<div class="children" style="margin-left:12px;padding-top:6px;"></div>` : ''}
                </div>`;
    }).join('');
    // si container fue el propio .repo-tree (string), reemplazar su innerHTML
    if (container.classList && container.classList.contains('repo-tree')) {
        container.innerHTML = html;
    } else {
        // si es un elemento 'children' dentro de una entry
        container.innerHTML = html;
    }
}

// Cargar repo raíz o ruta y renderizar en el árbol
async function loadRepoAndRender(repoFull, path = '') {
    const repoTree = document.querySelector('.repo-tree');
    const repoFileInfo = document.querySelector('.repo-file-info');
    const repoViewer = document.querySelector('.repo-file-content');
    if (!repoTree) return;
    const entries = await fetchGitHubRepoContents(repoFull, path);
    renderRepoEntries(entries, repoTree, repoFull);
    repoFileInfo.textContent = `Repositorio: ${repoFull} ${path ? ' / ' + path : ''}`;
    repoViewer.textContent = '';
}

// Ver archivo: usa download_url para obtener contenido bruto; muestra en visor si texto
async function viewGitHubFile(repoFull, path) {
    const infoEl = document.querySelector('.repo-file-info');
    const viewerEl = document.querySelector('.repo-file-content');
    if (!viewerEl) throw new Error('No viewer element');
    // Llamar API para obtener metadatos (contiene download_url o content)
    const meta = await fetchGitHubRepoContents(repoFull, path);
    // Si meta.content existe, puede estar en base64
    if (meta.content && meta.encoding === 'base64') {
        const decoded = atob(meta.content.replace(/\n/g,''));
        infoEl.textContent = `Archivo: ${meta.path} (${meta.size} bytes)`;
        viewerEl.textContent = decoded;
        return;
    }
    // Si existe download_url, obtenerlo
    if (meta.download_url) {
        const res = await fetch(meta.download_url);
        if (!res.ok) throw new Error('No se pudo descargar el archivo');
        // intentar leer como texto; si binario, mostrar mensaje
        const text = await res.text();
        infoEl.textContent = `Archivo: ${meta.path} (${meta.size || 'unknown'} bytes)`;
        viewerEl.textContent = text;
        return;
    }
    throw new Error('Contenido no disponible para visualizar');
}

// nuevo: renderizar info de presupuesto en la sección correspondiente
function renderBudgetInfo() {
    const project = window.currentProject || {};
    const presupuestoInicio = parseFloat(project.presupuesto) || 0;
    const movimientos = project.movimientos || [];
    const gastado = movimientos.reduce((sum, m) => sum + (m.type === 'out' ? m.amount : -0), 0) + movimientos.reduce((sum,m)=> sum + (m.type==='in' ? 0 : 0),0);
    // calculamos gastado como suma de out
    const totalGastado = movimientos.reduce((s,m)=> s + (m.type === 'out' ? m.amount : 0), 0);
    const restante = presupuestoInicio - totalGastado;
    
    const presupuestoEl = document.querySelector('.presupuesto-content');
    if (presupuestoEl) {
        presupuestoEl.innerHTML = `
            <p>Presupuesto de Inicio: $${presupuestoInicio.toFixed(2)}</p>
            <p>Gastado: $${totalGastado.toFixed(2)}</p>
            <p>Estado de presupuesto: $${restante.toFixed(2)}</p>
            <div class="transferencias-list">
                <h4>Movimientos recientes</h4>
                ${movimientos.slice().reverse().map(m => `
                    <div class="movimiento-item">
                        <strong>${m.type === 'in' ? '+' : '-'}$${m.amount.toFixed(2)}</strong> — ${escapeHTML(m.description || '')}
                        <span class="movimiento-fecha">${m.date}</span>
                    </div>
                `).join('') || '<p>No hay movimientos aún.</p>'}
            </div>
            <button class="btn-movimientos">Movimientos</button>
        `;
        
        // reasignar listener (se puede haber re-render)
        const btnMov = document.querySelector('.btn-movimientos');
        if (btnMov) btnMov.addEventListener('click', openAddMovementDialog);
    }
}

// Función para mostrar un diálogo simple y agregar movimiento
function openAddMovementDialog(e) {
    e && e.stopPropagation();
    const project = window.currentProject;
    if (!project) return alert('Proyecto no cargado');
    
    const tipo = prompt('Tipo de movimiento: escribe "in" para ingreso o "out" para gasto', 'out');
    if (!tipo || (tipo !== 'in' && tipo !== 'out')) return alert('Tipo inválido');
    const amountStr = prompt('Monto (ej: 250.50)', '0');
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert('Monto inválido');
    const description = prompt('Descripción (opcional)', '') || '';
    
    if (!project.movimientos) project.movimientos = [];
    project.movimientos.push({
        id: Date.now().toString(36),
        type: tipo,
        amount: amount,
        description: description,
        date: new Date().toLocaleString()
    });
    
    // Si no existe presupuesto inicial, pedirlo una sola vez
    if (!project.hasOwnProperty('presupuesto') || project.presupuesto === undefined || project.presupuesto === null) {
        const pStr = prompt('Define presupuesto inicial para el proyecto (valor numérico)', '0');
        const pVal = parseFloat(pStr);
        project.presupuesto = isNaN(pVal) ? 0 : pVal;
    }
    
    saveProject(project);
    window.currentProject = project;
    renderBudgetInfo();
    alert('Movimiento guardado');
}

// Funcionalidad de archivos
function addSectionButtonEvents() {
    // Botón para agregar archivo
    const addFileBtn = document.querySelector('.add-file-btn');
    if (addFileBtn) {
        addFileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleAddFile();
        });
    }
    
    // Botón para agregar tarea
    const addTaskBtn = document.querySelector('.add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleAddTask();
        });
    }
    
    // Botón para agregar nota
    const addNoteBtn = document.querySelector('.add-note-btn');
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleAddNote();
        });
    }
    
    // Delegación para togglear check de tareas
    document.querySelectorAll('.task-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function(e) {
            const taskEl = this.closest('.task-item');
            const id = taskEl.dataset.id;
            toggleTaskComplete(id, this.checked);
        });
    });
}

// Manejar añadir archivo con un input file oculto
function handleAddFile() {
    const project = window.currentProject;
    if (!project) return alert('Proyecto no cargado');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.addEventListener('change', (ev) => {
        const files = Array.from(ev.target.files || []);
        if (!files.length) {
            input.remove();
            return;
        }
        if (!project.archivos) project.archivos = [];
        files.forEach(f => {
            project.archivos.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: f.name, uploadedAt: new Date().toLocaleString() });
        });
        saveProject(project);
        window.currentProject = project;
        loadSectionData();
        alert(files.length + ' archivo(s) añadidos (simulado).');
        input.remove();
    });
    
    // disparar diálogo
    input.click();
}

// Añadir tarea (prompt básico)
function handleAddTask() {
    const project = window.currentProject;
    if (!project) return alert('Proyecto no cargado');
    const name = prompt('Nombre de la tarea', 'Nueva tarea');
    if (!name) return;
    const date = prompt('Fecha / estado (opcional)', '');
    if (!project.tareas) project.tareas = [];
    const task = { id: Date.now().toString(36), name: name, completed: false, date: date || '' };
    project.tareas.push(task);
    saveProject(project);
    window.currentProject = project;
    loadSectionData();
    alert('Tarea añadida');
}

function toggleTaskComplete(taskId, completed) {
    const project = window.currentProject;
    if (!project || !project.tareas) return;
    const t = project.tareas.find(x => x.id === taskId);
    if (!t) return;
    t.completed = !!completed;
    saveProject(project);
    window.currentProject = project;
    loadSectionData();
}

// Añadir nota (prompt básico)
function handleAddNote() {
    const project = window.currentProject;
    if (!project) return alert('Proyecto no cargado');
    const title = prompt('Título de la nota', 'Nota');
    if (!title) return;
    const content = prompt('Contenido de la nota', '');
    if (!project.notas) project.notas = [];
    project.notas.push({ id: Date.now().toString(36), title: title, content: content || '', date: new Date().toLocaleString() });
    saveProject(project);
    window.currentProject = project;
    loadSectionData();
    alert('Nota añadida');
}

// Escape sencillo para seguridad en insertHTML
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}