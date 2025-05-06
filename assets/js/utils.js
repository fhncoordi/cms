/**
 * utils.js
 * Módulo de utilidades generales para el CMS
 * Este módulo proporciona funciones auxiliares que son utilizadas por los otros módulos
 */

/**
 * Genera un ID único para cada tarjeta
 * La unicidad se consigue combinando el timestamp actual con un número aleatorio
 *
 * @returns {string} Un ID único en formato string
 */
function generateUniqueId() {
    return 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/**
 * Guarda un elemento en localStorage
 * Obtiene los elementos existentes, añade el nuevo y guarda la lista actualizada
 *
 * @param {Object} data - El objeto a guardar
 * @param {string} key - La clave en localStorage donde guardar los datos
 */
function saveToStorage(data, key) {
    // Recupera los elementos existentes o crea un array vacío si no existen
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    // Añade el nuevo elemento
    items.push(data);
    // Guarda la lista actualizada
    localStorage.setItem(key, JSON.stringify(items));
}

/**
 * Carga elementos desde localStorage
 *
 * @param {string} key - La clave de localStorage de donde cargar los datos
 * @returns {Array} Array de elementos almacenados o array vacío si no hay datos
 */
function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// Exportar las funciones haciendo que estén disponibles a través del objeto cmsUtils en window
window.cmsUtils = {
    generateUniqueId,  // Función para generar ID's únicos
    saveToStorage,     // Función para guardar en localStorage
    loadFromStorage    // Función para cargar desde localStorage
};