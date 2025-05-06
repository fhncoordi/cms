# Flujo de Eliminar Tarjeta

Este documento describe el flujo completo desde que se pulsa el botón para eliminar una tarjeta hasta que ésta desaparece de la página y del almacenamiento.

## 1. Inicio: Clic en el botón de eliminar

- **Elemento UI**: `<button class="btn btn-danger btn-delete-card" data-id="${id}"><i class="fas fa-trash"></i></button>`
- **Ubicación**: Dentro de cada tarjeta (proyectos o artículos destacados)
- **Acción**: Usuario hace clic en el botón con icono de papelera
- **Identificación**: Cada botón tiene un atributo `data-id` que contiene el ID único de la tarjeta

## 2. Activación del evento (project.js o featured.js)

### Para proyectos:

```javascript
// En createProjectCard()
const deleteButton = cardCol.querySelector('.btn-delete-card');
if (deleteButton) {
    deleteButton.addEventListener('click', function(e) {
        e.preventDefault();
        const cardId = this.getAttribute('data-id');
        deleteProject(cardId);
    });
}
```

### Para artículos destacados:

```javascript
// En createFeaturedArticle()
const deleteButton = cardDiv.querySelector('.btn-delete-featured');
if (deleteButton) {
    deleteButton.addEventListener('click', function(e) {
        e.preventDefault();
        const articleId = this.getAttribute('data-id');
        deleteFeatured(articleId);
    });
}
```

- **Acciones**:
  - Se previene el comportamiento por defecto del evento
  - Se obtiene el ID único de la tarjeta mediante `getAttribute('data-id')`
  - Se llama a la función correspondiente (`deleteProject()` o `deleteFeatured()`)

## 3. Proceso de eliminación (project.js o featured.js)

### Para proyectos:

```javascript
// En deleteProject()
function deleteProject(id) {
    // Obtener todos los proyectos
    let projects = loadProjects();
    
    // Filtrar el proyecto a eliminar
    projects = projects.filter(project => project.id !== id);
    
    // Guardar la lista actualizada
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    
    // Volver a renderizar
    renderProjects();
    
    // Mostrar un mensaje de confirmación
    showDeleteConfirmation();
}
```

### Para artículos destacados:

```javascript
// En deleteFeatured()
function deleteFeatured(id) {
    // Obtener todos los artículos
    let articles = loadFeatured();
    
    // Filtrar el artículo a eliminar
    articles = articles.filter(article => article.id !== id);
    
    // Guardar la lista actualizada
    localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(articles));
    
    // Volver a renderizar
    renderFeatured();
    
    // Mostrar un mensaje de confirmación
    showDeleteConfirmation();
}
```

- **Acciones**:
  - Se cargan todos los elementos desde localStorage
  - Se filtran los elementos para excluir el que se va a eliminar
  - Se actualiza localStorage con la nueva lista (sin el elemento eliminado)
  - Se vuelve a renderizar la sección correspondiente
  - Se muestra una notificación de confirmación

## 4. Cargar elementos (project.js o featured.js)

### Para proyectos:

```javascript
// En loadProjects()
function loadProjects() {
    return window.cmsUtils.loadFromStorage(PROJECTS_STORAGE_KEY);
}

// En utils.js
function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}
```

### Para artículos destacados:

```javascript
// En loadFeatured()
function loadFeatured() {
    return window.cmsUtils.loadFromStorage(FEATURED_STORAGE_KEY);
}
```

- **Acciones**:
  - Se llama a la función auxiliar `loadFromStorage()` de utils.js
  - Se recupera el array de elementos desde localStorage
  - Se parsea el JSON a un array de objetos JavaScript

## 5. Actualizar la visualización (project.js o featured.js)

### Para proyectos:

```javascript
// En renderProjects()
function renderProjects() {
    const cardsContainer = document.getElementById('dynamic-cards-container');
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    
    const projects = loadProjects();
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
```

### Para artículos destacados:

```javascript
// En renderFeatured()
function renderFeatured() {
    const articlesContainer = document.getElementById('featured-articles-container');
    if (!articlesContainer) return;
    
    articlesContainer.innerHTML = '';
    
    const articles = loadFeatured();
    isImageRight = false;
    
    articles.forEach(article => {
        const articleElement = createFeaturedArticle(
            article.id, 
            article.title, 
            article.content, 
            article.imageUrl, 
            isImageRight
        );
        articlesContainer.prepend(articleElement);
        isImageRight = !isImageRight;
    });
}
```

- **Acciones**:
  - Se obtiene el contenedor de elementos
  - Se limpia el contenedor (`innerHTML = ''`)
  - Se cargan los elementos desde localStorage (ya sin el eliminado)
  - Se itera sobre cada elemento y se crea su representación en el DOM
  - Se añaden los elementos al contenedor

## 6. Mostrar notificación (project.js o featured.js)

```javascript
// En showDeleteConfirmation()
function showDeleteConfirmation() {
    // Crear un toast de Bootstrap
    const toastContainer = document.createElement('div');
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = 11;
    
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
    
    document.body.appendChild(toastContainer);
    
    // Mostrar el toast
    const toastElement = toastContainer.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Eliminar el elemento del DOM cuando se oculte
    toastElement.addEventListener('hidden.bs.toast', function() {
        document.body.removeChild(toastContainer);
    });
}
```

- **Acciones**:
  - Se crea un elemento toast de Bootstrap
  - Se configura con el mensaje de confirmación
  - Se añade al DOM
  - Se muestra la notificación por 3 segundos
  - Se elimina del DOM cuando se oculta

## 7. Resultado final

- **UI**: La tarjeta eliminada desaparece de la página
- **Almacenamiento**: La tarjeta ya no existe en localStorage
- **Notificación**: Se muestra una confirmación temporal de éxito

## Diagrama de secuencia simplificado

```
Usuario → UI: Clic en botón eliminar
UI → project.js/featured.js: Activar evento de click
project.js/featured.js → project.js/featured.js: deleteProject()/deleteFeatured()
project.js/featured.js → utils.js: loadFromStorage()
utils.js → localStorage: Obtener lista actual
project.js/featured.js → Array: Filtrar elemento a eliminar
project.js/featured.js → localStorage: Guardar lista actualizada
project.js/featured.js → project.js/featured.js: renderProjects()/renderFeatured()
project.js/featured.js → DOM: Limpiar contenedor
project.js/featured.js → utils.js: loadFromStorage()
project.js/featured.js → DOM: Crear y añadir elementos
project.js/featured.js → UI: showDeleteConfirmation()
UI → Usuario: Mostrar notificación
UI → DOM: Eliminar notificación después de 3s
```

Este flujo muestra cómo se mantiene la modularidad del sistema incluso en operaciones de eliminación. Cada módulo maneja su propio tipo de contenido, pero comparten patrones similares, lo que hace que el código sea mantenible y fácil de entender.