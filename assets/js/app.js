/**
 * app.js
 * Archivo principal que inicializa y controla la aplicación CMS
 * Este módulo coordina la interacción entre los diferentes componentes
 */

/**
 * @typedef {Object} BootstrapModal
 * @property {function} getInstance - Método para obtener la instancia de un modal existente
 * @property {function} hide - Método para ocultar el modal
 *
 * @typedef {Object} Bootstrap
 * @property {BootstrapModal} Modal - Clase Modal de Bootstrap
 *
 * @type {Bootstrap} bootstrap - Variable global de Bootstrap
 */
/* global bootstrap */

// Variable global para almacenar el tipo de tarjeta que se está agregando actualmente
let currentCardType = 'project';

/**
 * Maneja el envío del formulario para añadir una nueva tarjeta
 * Obtiene los datos del formulario, determina el tipo de tarjeta a crear, y la añade
 *
 * @param {Event} event - El evento de envío del formulario
 */
function handleFormSubmit(event) {
    // Prevenir el comportamiento predeterminado del formulario (evitar recarga de página)
    event.preventDefault();

    // Obtener los valores de los campos del formulario
    const title = document.getElementById('newCardTitle').value;
    const content = document.getElementById('newCardContent').value;

    // Valor predeterminado para la imagen (placeholder)
    let imageUrl = 'assets/img/';

    // Comprobar si se proporcionó una URL de imagen personalizada
    const imageInput = document.getElementById('newCardImage');
    if (imageInput && imageInput.value) {
        // Usar la URL proporcionada por el usuario
        imageUrl = imageInput.value;
    }

    // Añadir la nueva tarjeta según el tipo actual (proyecto o artículo destacado)
    if (currentCardType === 'project') {
        // Llamar al método de añadir proyecto del módulo projectManager
        window.projectManager.add(title, content, imageUrl);
    } else {
        // Llamar al método de añadir artículo del módulo featuredManager
        window.featuredManager.add(title, content, imageUrl);
    }

    // Cerrar el modal después de añadir la tarjeta
    const modal = bootstrap.Modal.getInstance(document.getElementById('newCardModal'));
    if (modal) modal.hide();

    // Limpiar el formulario para futuros usos
    document.getElementById('newCardForm').reset();
}

/**
 * Configura el botón de Agregar Proyecto
 * Establece los controladores de eventos y personaliza el modal para proyectos
 */
function setupAddProjectButton() {
    // Obtener el botón de agregar proyecto
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        // Añadir el evento de clic
        addProjectBtn.addEventListener('click', function() {
            // Establecer el tipo actual como 'project'
            currentCardType = 'project';

            // Personalizar el título y placeholders del modal para proyectos
            document.getElementById('newCardModalLabel').textContent = 'Agregar Nuevo Proyecto';
            document.getElementById('newCardTitle').placeholder = 'Ej: Proyecto Laurisilva';
            document.getElementById('newCardContent').placeholder = 'Ej: Un breve ejemplo de contenido para este proyecto...';
        });
    }
}

/**
 * Configura el botón de Agregar Destacado
 * Establece los controladores de eventos y personaliza el modal para artículos destacados
 */
function setupAddFeaturedButton() {
    // Obtener el botón de agregar artículo destacado
    const addFeaturedBtn = document.getElementById('addFeaturedBtn');
    if (addFeaturedBtn) {
        // Añadir el evento de clic
        addFeaturedBtn.addEventListener('click', function() {
            // Establecer el tipo actual como 'featured'
            currentCardType = 'featured';

            // Personalizar el título y placeholders del modal para artículos destacados
            document.getElementById('newCardModalLabel').textContent = 'Agregar Artículo Destacado';
            document.getElementById('newCardTitle').placeholder = 'Ej: Artículo Especial';
            document.getElementById('newCardContent').placeholder = 'Ej: Esta es una tarjeta más amplia con texto de apoyo...';
        });
    }
}

/**
 * Configura el formulario para añadir nuevas tarjetas
 * Añade el controlador de eventos para el envío del formulario
 */
function setupForm() {
    // Obtener el formulario
    const newCardForm = document.getElementById('newCardForm');
    if (newCardForm) {
        // Añadir el evento de envío
        newCardForm.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Inicializa la aplicación CMS
 * Esta función se llama cuando el DOM está completamente cargado
 */
function initApp() {
    // Cargar y renderizar las tarjetas existentes almacenadas en localStorage
    window.projectManager.render();
    window.featuredManager.render();

    // Configurar los botones y formularios
    setupAddProjectButton();
    setupAddFeaturedButton();
    setupForm();

    // Mensaje de confirmación en la consola
    console.log('CMS inicializado correctamente');
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initApp);