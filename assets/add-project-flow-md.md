# Flujo de Agregar Proyecto

Este documento describe el flujo completo desde que se pulsa el botón "Agregar Proyecto" hasta que se agrega el nuevo proyecto al DOM.

## 1. Inicio: Clic en el botón "Agregar Proyecto"

- **Elemento UI**: `<button id="addProjectBtn">Agregar Proyecto</button>`
- **Ubicación**: Sección "Proyectos" en la página principal
- **Acción**: Usuario hace clic en el botón
- **Resultado**: Se abre un modal para introducir los datos del nuevo proyecto

## 2. Configuración del modal (app.js)

```javascript
// En setupAddProjectButton()
addProjectBtn.addEventListener('click', function() {
    currentCardType = 'project';
    document.getElementById('newCardModalLabel').textContent = 'Agregar Nuevo Proyecto';
    document.getElementById('newCardTitle').placeholder = 'Ej: Proyecto Laurisilva';
    document.getElementById('newCardContent').placeholder = 'Ej: Un breve ejemplo de contenido para este proyecto...';
});
```

- **Acciones**:
  - Se establece `currentCardType = 'project'`
  - Se actualiza el título del modal
  - Se personalizan los placeholders del formulario
  - Bootstrap muestra el modal (gracias al atributo `data-bs-toggle="modal"` del botón)

## 3. Usuario completa el formulario

- **Campos del formulario**:
  - Título del proyecto (`newCardTitle`)
  - Descripción/contenido (`newCardContent`)
  - URL de imagen (opcional) (`newCardImage`)
- **Acciones**: El usuario introduce los datos y hace clic en "Agregar Proyecto"

## 4. Envío del formulario (app.js)

```javascript
// En handleFormSubmit()
function handleFormSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('newCardTitle').value;
    const content = document.getElementById('newCardContent').value;
    let imageUrl = '/api/placeholder/300/200';
    
    const imageInput = document.getElementById('newCardImage');
    if (imageInput && imageInput.value) {
        imageUrl = imageInput.value;
    }
    
    if (currentCardType === 'project') {
        window.projectManager.add(title, content, imageUrl);
    } else {
        window.featuredManager.add(title, content, imageUrl);
    }
    
    // Cerrar modal y resetear formulario
    const modal = bootstrap.Modal.getInstance(document.getElementById('newCardModal'));
    if (modal) modal.hide();
    document.getElementById('newCardForm').reset();
}
```

- **Acciones**:
  - Se previene el comportamiento por defecto del formulario
  - Se obtienen los valores de los campos
  - Se determina la URL de la imagen (personalizada o placeholder)
  - Se identifica el tipo de tarjeta a crear (`project`)
  - Se llama a `projectManager.add()` con los datos

## 5. Creación del proyecto (project.js)

```javascript
// En addProject()
function addProject(title, content, imageUrl) {
    const id = window.cmsUtils.generateUniqueId();
    const project = {
        id: id,
        title: title,
        content: content,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString()
    };
    
    saveProject(project);
    renderProjects();
    
    return project;
}
```

- **Acciones**:
  - Se genera un ID único para el proyecto mediante `generateUniqueId()`
  - Se crea un objeto con la información del proyecto
  - Se guarda el proyecto en almacenamiento mediante `saveProject()`
  - Se renderizan todos los proyectos mediante `renderProjects()`

## 6. Generar ID único (utils.js)

```javascript
// En generateUniqueId()
function generateUniqueId() {
    return 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}
```

- **Acciones**:
  - Se combina la marca de tiempo actual con un número aleatorio
  - Se devuelve un string único que servirá como identificador del proyecto

## 7. Guardar en localStorage (project.js y utils.js)

```javascript
// En saveProject()
function saveProject(project) {
    window.cmsUtils.saveToStorage(project, PROJECTS_STORAGE_KEY);
}

// En utils.js - saveToStorage()
function saveToStorage(data, key) {
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    items.push(data);
    localStorage.setItem(key, JSON.stringify(items));
}
```

- **Acciones**:
  - Se llama a la función `saveToStorage()` de utils.js
  - Se obtienen los proyectos existentes del localStorage
  - Se añade el nuevo proyecto a la lista
  - Se guarda la lista actualizada en localStorage bajo la clave 'cms_cards'

## 8. Renderizar la visualización (project.js)

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

- **Acciones**:
  - Se obtiene el contenedor de proyectos (`dynamic-cards-container`)
  - Se limpia el contenedor actual con `innerHTML = ''`
  - Se cargan todos los proyectos con `loadProjects()`
  - Para cada proyecto:
    - Se crea el elemento DOM con `createProjectCard()`
    - Se añade al contenedor con `appendChild()`

## 9. Cargar proyectos desde localStorage (project.js)

```javascript
// En loadProjects()
function loadProjects() {
    return window.cmsUtils.loadFromStorage(PROJECTS_STORAGE_KEY);
}

// En utils.js - loadFromStorage()
function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}
```

- **Acciones**:
  - Se llama a la función `loadFromStorage()` de utils.js
  - Se recupera el array de proyectos desde localStorage
  - Se devuelve el array parseado a objetos JavaScript

## 10. Crear elemento DOM (project.js)

```javascript
// En createProjectCard()
function createProjectCard(id, title, content, imageUrl) {
    // Crear el elemento de la card
    const cardCol = document.createElement('div');
    cardCol.className = 'col-md-4 mb-4';
    cardCol.id = id;
    
    // Plantilla HTML para la card
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
    
    // Agregar event listener al botón de eliminar
    const deleteButton = cardCol.querySelector('.btn-delete-card');
    if (deleteButton) {
        deleteButton.addEventListener('click', function(e) {
            e.preventDefault();
            const cardId = this.getAttribute('data-id');
            deleteProject(cardId);
        });
    }
    
    return cardCol;
}
```

- **Acciones**:
  - Se crea un nuevo elemento div (columna)
  - Se establece la clase CSS y el ID
  - Se genera el HTML de la tarjeta con todos sus elementos:
    - Imagen
    - Título
    - Contenido
    - Botones de "Leer más" y "Eliminar"
  - Se configura el event listener para el botón de eliminar
  - Se devuelve el elemento DOM completo

## 11. Final: Cerrar el modal

```javascript
// En handleFormSubmit()
const modal = bootstrap.Modal.getInstance(document.getElementById('newCardModal'));
if (modal) modal.hide();
document.getElementById('newCardForm').reset();
```

- **Acciones**:
  - Se obtiene la instancia del modal con `bootstrap.Modal.getInstance()`
  - Se oculta el modal con `modal.hide()`
  - Se resetea el formulario con `form.reset()`
  - El proyecto ahora está visible en la página, almacenado en localStorage, y tiene funcionalidad de eliminación

## 12. Resultado final

- **UI**: El nuevo proyecto aparece en la sección "Proyectos" en el grid
- **Almacenamiento**: El proyecto queda guardado en localStorage bajo la clave 'cms_cards'
- **Comportamiento**: El proyecto tiene funcionalidad de eliminación gracias al botón de papelera
- **Posición**: Se añade como una nueva tarjeta en el grid de 3 columnas

## Diagrama de secuencia simplificado

```
Usuario → UI: Clic en "Agregar Proyecto"
UI → app.js: Configurar modal
UI → Usuario: Mostrar formulario
Usuario → UI: Completar formulario y enviar
UI → app.js: handleFormSubmit()
app.js → project.js: addProject()
project.js → utils.js: generateUniqueId()
project.js → utils.js: saveToStorage()
utils.js → localStorage: Guardar proyecto
project.js → project.js: renderProjects()
project.js → utils.js: loadFromStorage()
utils.js → localStorage: Cargar proyectos
project.js → project.js: createProjectCard() (para cada proyecto)
project.js → DOM: Añadir elementos al contenedor
DOM → Usuario: Mostrar grid actualizado con el nuevo proyecto
app.js → UI: Cerrar modal y resetear formulario
```

Este flujo demuestra cómo los diferentes módulos del CMS (app.js, project.js, utils.js) trabajan juntos de manera coordinada para manejar la creación de proyectos, mientras cada uno mantiene sus responsabilidades específicas.