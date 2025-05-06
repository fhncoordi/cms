# Flujo de Agregar Artículo Destacado

Este documento describe el flujo completo desde que se pulsa el botón "Agregar Destacado" hasta que se muestra el nuevo artículo en la página.

## 1. Inicio: Clic en el botón "Agregar Destacado"

- **Elemento UI**: `<button id="addFeaturedBtn">Agregar Destacado</button>`
- **Ubicación**: Sección "Otros Artículos" en la página principal
- **Acción**: Usuario hace clic en el botón
- **Resultado**: Se abre un modal para introducir los datos del nuevo artículo

## 2. Configuración del modal (app.js)

```javascript
// En setupAddFeaturedButton()
addFeaturedBtn.addEventListener('click', function() {
    currentCardType = 'featured';
    document.getElementById('newCardModalLabel').textContent = 'Agregar Artículo Destacado';
    document.getElementById('newCardTitle').placeholder = 'Ej: Artículo Especial';
    document.getElementById('newCardContent').placeholder = 'Ej: Esta es una tarjeta más amplia...';
});
```

- **Acciones**:
  - Se establece `currentCardType = 'featured'`
  - Se actualiza el título del modal
  - Se personalizan los placeholders del formulario
  - Bootstrap muestra el modal

## 3. Usuario completa el formulario

- **Campos del formulario**:
  - Título del artículo (`newCardTitle`)
  - Contenido/descripción (`newCardContent`)
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
  - Se determina la URL de la imagen
  - Se identifica el tipo de tarjeta a crear (`featured`)
  - Se llama a `featuredManager.add()` con los datos

## 5. Creación del artículo (featured.js)

```javascript
// En addFeatured()
function addFeatured(title, content, imageUrl) {
    const id = window.cmsUtils.generateUniqueId();
    const article = {
        id: id,
        title: title,
        content: content,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString()
    };
    
    saveFeatured(article);
    renderFeatured();
    
    return article;
}
```

- **Acciones**:
  - Se genera un ID único para el artículo
  - Se crea un objeto con la información del artículo
  - Se guarda el artículo en almacenamiento
  - Se renderizan todos los artículos

## 6. Guardar en localStorage (featured.js)

```javascript
// En saveFeatured()
function saveFeatured(article) {
    window.cmsUtils.saveToStorage(article, FEATURED_STORAGE_KEY);
}

// En utils.js - saveToStorage()
function saveToStorage(data, key) {
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    items.push(data);
    localStorage.setItem(key, JSON.stringify(items));
}
```

- **Acciones**:
  - Se obtienen los artículos existentes del localStorage
  - Se añade el nuevo artículo a la lista
  - Se guarda la lista actualizada en localStorage

## 7. Renderizar la visualización (featured.js)

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
  - Se obtiene el contenedor de artículos destacados
  - Se limpia el contenedor
  - Se cargan todos los artículos desde localStorage
  - Se establecen posiciones alternadas para las imágenes
  - Para cada artículo:
    - Se crea el elemento DOM
    - Se añade al inicio del contenedor
    - Se alterna la posición para el siguiente artículo

## 8. Crear elemento DOM (featured.js)

```javascript
// En createFeaturedArticle()
function createFeaturedArticle(id, title, content, imageUrl, isImageRightPos = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card mb-3';
    cardDiv.id = id;
    cardDiv.style.maxWidth = '100%';
    
    // HTML diferente según posición de imagen
    let cardHTML = '';
    
    if (isImageRightPos) {
        cardHTML = `<!-- HTML con imagen a la derecha -->`;
    } else {
        cardHTML = `<!-- HTML con imagen a la izquierda -->`;
    }
    
    cardDiv.innerHTML = cardHTML;
    
    // Configurar botón de eliminar
    const deleteButton = cardDiv.querySelector('.btn-delete-featured');
    if (deleteButton) {
        deleteButton.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.getAttribute('data-id');
            deleteFeatured(articleId);
        });
    }
    
    return cardDiv;
}
```

- **Acciones**:
  - Se crea un nuevo elemento div
  - Se genera HTML diferente según posición de imagen
  - Se configura event listener para el botón de eliminar
  - Se devuelve el elemento DOM completo

## 9. Resultado final

- **UI**: El nuevo artículo destacado aparece en la sección "Otros Artículos"
- **Almacenamiento**: El artículo queda guardado en localStorage
- **Comportamiento**: El artículo tiene funcionalidad de eliminación
- **Posición**: Se añade al principio con imagen a izquierda/derecha alternando

## Diagrama de secuencia simplificado

```
Usuario → UI: Clic en "Agregar Destacado"
UI → app.js: Configurar modal
UI → Usuario: Mostrar formulario
Usuario → UI: Completar formulario y enviar
UI → app.js: handleFormSubmit()
app.js → featured.js: addFeatured()
featured.js → utils.js: generateUniqueId()
featured.js → utils.js: saveToStorage()
featured.js → localStorage: Guardar artículo
featured.js → featured.js: renderFeatured()
featured.js → localStorage: Cargar artículos
featured.js → featured.js: createFeaturedArticle()
featured.js → DOM: Añadir elemento
DOM → Usuario: Mostrar nuevo artículo
```

Este flujo demuestra el diseño modular de la aplicación, donde cada módulo tiene responsabilidades específicas pero trabajan juntos de manera coordinada.