/**
 * project.js
 * Módulo para gestionar las tarjetas de proyectos
 * Este módulo se encarga de crear, guardar, cargar, renderizar y eliminar proyectos
 */
/* global bootstrap */

// Clave para almacenar los proyectos en localStorage
const PROJECTS_STORAGE_KEY = 'cms_cards';

/**
 * Crea un elemento de tarjeta de proyecto con toda su estructura HTML
 *
 * @param {string} id - ID único del proyecto
 * @param {string} title - Título del proyecto
 * @param {string} content - Descripción o contenido del proyecto
 * @param {string} imageUrl - URL de la imagen del proyecto (opcional)
 * @returns {HTMLElement} Elemento DOM de la tarjeta creada
 */
function createProjectCard(id, title, content, imageUrl) {
    // Crear el elemento contenedor de la card (columna)
    const cardCol = document.createElement('div');
    cardCol.className = 'col-md-4 mb-4';
    cardCol.id = id;

    // Plantilla HTML para la card con todos sus elementos
    cardCol.innerHTML = `
        <div class="card h-100">
            <img src="${imageUrl || '/api/placeholder/300/200'}" class="card-img-top" alt="${title}">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${content}</p>
                <div class="d-flex justify-content-between">
                    <a href="#" class="btn btn-primary">Leer más</a>
                    <button class="btn btn-danger btn-delete-card" data-id="${id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Agregar event listener al botón de eliminar para manejar la eliminación
    const deleteButton = cardCol.querySelector('.btn-delete-card');
    if (deleteButton) {
        deleteButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Obtener el ID del proyecto a partir del atributo data-id
            const cardId = this.getAttribute('data-id');
            // Llamar a la función de eliminación
            deleteProject(cardId);
        });
    }

    return cardCol;
}

/**
 * Guarda un proyecto en localStorage utilizando la función auxiliar de utils.js
 *
 * @param {Object} project - Objeto del proyecto a guardar
 */
function saveProject(project) {
    window.cmsUtils.saveToStorage(project, PROJECTS_STORAGE_KEY);
}

/**
 * Carga todos los proyectos desde localStorage utilizando la función auxiliar de utils.js
 *
 * @returns {Array} Array de objetos de proyectos
 */
function loadProjects() {
    return window.cmsUtils.loadFromStorage(PROJECTS_STORAGE_KEY);
}

/**
 * Elimina un proyecto específico identificado por su ID
 *
 * @param {string} id - ID único del proyecto a eliminar
 */
function deleteProject(id) {
    // Obtener todos los proyectos
    let projects = loadProjects();

    // Filtrar el proyecto a eliminar (mantener todos excepto el que tiene el ID especificado)
    projects = projects.filter(project => project.id !== id);

    // Guardar la lista actualizada en localStorage
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));

    // Volver a renderizar la lista de proyectos
    renderProjects();

    // Mostrar un mensaje de confirmación de la eliminación
    showDeleteConfirmation();
}

/**
 * Muestra una notificación toast de Bootstrap confirmando la eliminación
 * La notificación aparece en la esquina inferior derecha y desaparece después de 3 segundos
 */
function showDeleteConfirmation() {
    // Crear un contenedor para el toast
    const toastContainer = document.createElement('div');
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = 11 + "";

    // Crear la estructura HTML del toast
    toastContainer.innerHTML = `
        <div id="deleteToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white">
                <strong class="me-auto">CMS</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                Elemento eliminado correctamente.
            </div>
        </div>
    `;

    // Añadir el toast al cuerpo del documento
    document.body.appendChild(toastContainer);

    // Inicializar y mostrar el toast utilizando la API de Bootstrap
    const toastElement = toastContainer.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 }); // Desaparece después de 3 segundos
    toast.show();

    // Eliminar el elemento toast del DOM cuando se oculte (evitar acumulación de elementos)
    toastElement.addEventListener('hidden.bs.toast', function() {
        document.body.removeChild(toastContainer);
    });
}

/**
 * Renderiza todos los proyectos en el contenedor correspondiente
 * Esta función limpia el contenedor y añade todas las tarjetas de proyectos
 */
function renderProjects() {
    // Obtener el contenedor donde se mostrarán las tarjetas
    const cardsContainer = document.getElementById('dynamic-cards-container');
    if (!cardsContainer) return; // Si no existe el contenedor, salir

    cardsContainer.innerHTML = ''; // Limpiar el contenedor

    // Cargar todos los proyectos almacenados
    const projects = loadProjects();

    // Para cada proyecto, crear su tarjeta y añadirla al contenedor
    projects.forEach(project => {
        const cardElement = createProjectCard(
            project.id,
            project.title,
            project.content,
            project.imageUrl
        );
        cardsContainer.appendChild(cardElement);
    });
}

/**
 * Añade un nuevo proyecto, lo guarda y actualiza la visualización
 *
 * @param {string} title - Título del nuevo proyecto
 * @param {string} content - Descripción del nuevo proyecto
 * @param {string} imageUrl - URL de la imagen del proyecto (opcional)
 * @returns {Object} El objeto del proyecto creado
 */
function addProject(title, content, imageUrl) {
    // Generar un ID único para el nuevo proyecto
    const id = window.cmsUtils.generateUniqueId();

    // Crear el objeto del proyecto
    const project = {
        id: id,
        title: title,
        content: content,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString() // Añadir fecha de creación
    };

    // Guardar en el almacenamiento
    saveProject(project);

    // Renderizar todos los proyectos
    renderProjects();

    return project;
}

// Exportar las funciones a través del objeto projectManager en window
window.projectManager = {
    createCard: createProjectCard, // Función para crear una tarjeta de proyecto
    save: saveProject,             // Función para guardar un proyecto
    load: loadProjects,            // Función para cargar proyectos
    render: renderProjects,        // Función para renderizar todos los proyectos
    add: addProject,               // Función para añadir un nuevo proyecto
    delete: deleteProject          // Función para eliminar un proyecto
};