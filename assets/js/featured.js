/**
 * featured.js
 * Módulo para gestionar los artículos destacados
 * Este módulo se encarga de crear, guardar, cargar, renderizar y eliminar artículos destacados
 */

/**
 * @typedef {Object} BootstrapToast
 * @property {function} show - Método para mostrar el toast
 * @property {function} hide - Método para ocultar el toast
 *
 * @typedef {Object} ToastOptions
 * @property {number} delay - Tiempo en milisegundos antes de que el toast se oculte automáticamente
 *
 * @typedef {Object} BootstrapModal
 * @property {function} getInstance - Método para obtener la instancia de un modal existente
 * @property {function} hide - Método para ocultar el modal
 *
 * @typedef {Object} Bootstrap
 * @property {BootstrapModal} Modal - Clase Modal de Bootstrap
 * @property {function} Toast - Constructor para crear toasts de Bootstrap
 *
 * @type {Bootstrap} bootstrap - Variable global de Bootstrap
 */
/* global bootstrap */

// Clave para almacenar los artículos destacados en localStorage
const FEATURED_STORAGE_KEY = 'cms_featured_articles';

// Variable para alternar la posición de la imagen (izquierda/derecha)
let isImageRight = false;

/**
 * Crea un elemento de artículo destacado con toda su estructura HTML
 *
 * @param {string} id - ID único del artículo
 * @param {string} title - Título del artículo
 * @param {string} content - Descripción o contenido del artículo
 * @param {string} imageUrl - URL de la imagen del artículo (opcional)
 * @param {boolean} isImageRightPos - Si es true, la imagen se muestra a la derecha, si es false, a la izquierda
 * @returns {HTMLElement} Elemento DOM del artículo creado
 */
function createFeaturedArticle(id, title, content, imageUrl, isImageRightPos = false) {
    // Crear el elemento contenedor del artículo
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card mb-3';
    cardDiv.id = id;
    cardDiv.style.maxWidth = '100%';

    // Variable para almacenar el HTML que varía según la posición de la imagen
    let cardHTML = '';

    // Estructura HTML diferente dependiendo de si la imagen va a la derecha o izquierda
    if (isImageRightPos) {
        // Imagen a la derecha: primero el contenido, luego la imagen
        cardHTML = `
            <div class="row g-0">
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${content}</p>
                        <p class="card-text"><small class="text-muted">Última actualización hace unos minutos</small></p>
                        <div class="d-flex">
                            <a href="#" class="btn btn-outline-primary me-2">Leer más</a>
                            <button class="btn btn-outline-danger btn-delete-featured" data-id="${id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <img src="${imageUrl || '/api/placeholder/300/250'}" class="img-fluid rounded-end" alt="${title}">
                </div>
            </div>
        `;
    } else {
        // Imagen a la izquierda: primero la imagen, luego el contenido
        cardHTML = `
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${imageUrl || '/api/placeholder/300/250'}" class="img-fluid rounded-start" alt="${title}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${content}</p>
                        <p class="card-text"><small class="text-muted">Última actualización hace unos minutos</small></p>
                        <div class="d-flex">
                            <a href="#" class="btn btn-outline-primary me-2">Leer más</a>
                            <button class="btn btn-outline-danger btn-delete-featured" data-id="${id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Asignar el HTML generado al elemento
    cardDiv.innerHTML = cardHTML;

    // Agregar event listener al botón de eliminar para manejar la eliminación
    const deleteButton = cardDiv.querySelector('.btn-delete-featured');
    if (deleteButton) {
        deleteButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Obtener el ID del artículo a partir del atributo data-id
            const articleId = this.getAttribute('data-id');
            // Llamar a la función de eliminación
            deleteFeatured(articleId);
        });
    }

    return cardDiv;
}

/**
 * Guarda un artículo destacado en localStorage utilizando la función auxiliar de utils.js
 *
 * @param {Object} article - Objeto del artículo a guardar
 */
function saveFeatured(article) {
    window.cmsUtils.saveToStorage(article, FEATURED_STORAGE_KEY);
}

/**
 * Carga todos los artículos destacados desde localStorage utilizando la función auxiliar de utils.js
 *
 * @returns {Array} Array de objetos de artículos destacados
 */
function loadFeatured() {
    return window.cmsUtils.loadFromStorage(FEATURED_STORAGE_KEY);
}

/**
 * Elimina un artículo destacado específico identificado por su ID
 *
 * @param {string} id - ID único del artículo a eliminar
 */
function deleteFeatured(id) {
    // Obtener todos los artículos
    let articles = loadFeatured();

    // Filtrar el artículo a eliminar (mantener todos excepto el que tiene el ID especificado)
    articles = articles.filter(article => article.id !== id);

    // Guardar la lista actualizada en localStorage
    localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(articles));

    // Volver a renderizar la lista de artículos
    renderFeatured();

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
                Artículo destacado eliminado correctamente.
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
 * Renderiza todos los artículos destacados en el contenedor correspondiente
 * Esta función limpia el contenedor y añade todos los artículos destacados,
 * alternando la posición de las imágenes (izquierda/derecha)
 */
function renderFeatured() {
    // Obtener el contenedor donde se mostrarán los artículos
    const articlesContainer = document.getElementById('featured-articles-container');
    if (!articlesContainer) return; // Si no existe el contenedor, salir

    articlesContainer.innerHTML = ''; // Limpiar el contenedor

    // Cargar todos los artículos almacenados
    const articles = loadFeatured();

    // Reiniciar la variable de posición de imagen para empezar con imagen a la izquierda
    isImageRight = false;

    // Para cada artículo, crear su elemento y añadirlo al contenedor
    articles.forEach(article => {
        const articleElement = createFeaturedArticle(
            article.id,
            article.title,
            article.content,
            article.imageUrl,
            isImageRight
        );
        articlesContainer.prepend(articleElement); // Agregar al principio (los más nuevos arriba)
        isImageRight = !isImageRight; // Alternar la posición de la imagen para el próximo artículo
    });
}

/**
 * Añade un nuevo artículo destacado, lo guarda y actualiza la visualización
 *
 * @param {string} title - Título del nuevo artículo
 * @param {string} content - Descripción del nuevo artículo
 * @param {string} imageUrl - URL de la imagen del artículo (opcional)
 * @returns {Object} El objeto del artículo creado
 */
function addFeatured(title, content, imageUrl) {
    // Generar un ID único para el nuevo artículo
    const id = window.cmsUtils.generateUniqueId();

    // Crear el objeto del artículo
    const article = {
        id: id,
        title: title,
        content: content,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString() // Añadir fecha de creación
    };

    // Guardar en el almacenamiento
    saveFeatured(article);

    // Renderizar todos los artículos destacados
    renderFeatured();

    return article;
}

// Exportar las funciones a través del objeto featuredManager en window
window.featuredManager = {
    createArticle: createFeaturedArticle, // Función para crear un artículo destacado
    save: saveFeatured,                   // Función para guardar un artículo
    load: loadFeatured,                   // Función para cargar artículos
    render: renderFeatured,               // Función para renderizar todos los artículos
    add: addFeatured,                     // Función para añadir un nuevo artículo
    delete: deleteFeatured                // Función para eliminar un artículo
};