# Guion para el cliente — Sitio web y alta de productos

Documento para **presentar o entregar** al cliente: recorrido del sitio público y creación de productos en el panel (con significado de cada campo).

---

## Parte 1 — La página, paso a paso (visitante)

### 1. Inicio

Es la carta de presentación: mensaje principal, categorías o accesos rápidos, productos destacados, bloque de servicio técnico, por qué elegirlos, testimonios, preguntas frecuentes y un cierre con llamado a la acción. Casi todo ese texto se puede cambiar desde el backoffice en **Contenido** (sin tocar código).

### 2. Tienda / Catálogo

Listado de productos con filtros (categoría, marca, precio, condición nueva/usada, etc.). Los precios se muestran en **USD** como referencia; el cierre final suele ser por **WhatsApp**.

### 3. Ficha de producto

Al entrar a un producto: fotos, nombre, resumen, precio (y variantes si las hay: color, memoria, etc.), botón de **favoritos**, **agregar al carrito** y enlace a **WhatsApp** para consultar o cerrar compra.

### 4. Favoritos

Lista guardada **solo en el navegador** del usuario (si borra datos o cambia de dispositivo, puede perderla). Sirve para armar una selección antes de escribir por WhatsApp.

### 5. Carrito

Resume lo que eligió, cantidades y total orientativo en **USD**. No paga en la web: el botón **Finalizar por WhatsApp** arma un mensaje con el pedido para que ustedes respondan disponibilidad, retiro y pago.

### 6. Servicio técnico

Zona de reparaciones: entrada general, **precios** en tablas (contenido editable en el backoffice), y **formulario de solicitud** que también deriva a WhatsApp. Puede haber **seguimiento por código** si lo tienen publicado.

### 7. Vende tu equipo

Página para quien quiere vender un usado: explica el proceso y los lleva al contacto (según cómo la tengan armada).

### 8. Pie de página

Datos de contacto, enlaces útiles y redes; en muchos casos editable desde **Contenido → Footer**.

### Mensaje clave para el cliente

> La web **informa**, **filtra** y **ordena el contacto**; el negocio se **cierra por WhatsApp** (o en tienda), **no con tarjeta en el sitio**.

---

## Parte 2 — Crear un producto (backoffice), paso a paso y qué es cada cosa

### Antes (si hace falta)

- **Listas → Categorías:** son las “gavetas” del catálogo (iPhone, iPad, AirPods…). Si no existe la que necesitán, la crean acá.
- Las **variantes** (color, memoria) **no** se crean en Categorías: la categoría es solo **dónde aparece** el producto en la tienda.

### Entrada

**Productos → Nuevo producto.**

### Modo de creación

- **Asistente** (recomendado, suele venir por defecto): pasos guiados.
- **Una página:** todo el formulario junto.

Si **cambian de modo** a mitad de carga, conviene **guardar antes** o copiar datos, porque el formulario se reconstruye y puede perderse lo escrito sin guardar.

---

### Asistente — pasos y significados

#### Paso Inicio

Solo orientación: qué van a completar y en qué orden.

#### Paso Nombre (identidad)

| Campo | Qué significa |
|--------|----------------|
| **ID del producto** | Texto único, sin espacios, minúsculas y guiones. Es la **URL** (`/tienda/ese-id`) y la **carpeta de fotos**. **No se cambia** después de crear. |
| **Nombre en la tienda** | Título que ve el cliente en la ficha y en enlaces. |
| **Resumen** | Texto corto que se ve en el **listado** del catálogo. |
| **Marca (opcional)** | Aparece en la ficha y en el **filtro de marcas**; si no ponen marca, puede agruparse en “otras marcas”. |

#### Paso Tienda (categoría y precio)

| Campo | Qué significa |
|--------|----------------|
| **Categoría del catálogo** | En qué **filtro** del catálogo aparece (iPhone, iPad, etc.). **No** es color ni memoria. |
| **Precio base (USD)** | Precio de referencia en **dólares**. |
| **Condición** | Etiqueta **Nuevo / Usado** (o sin etiqueta). |
| **Badge** | Texto opcional en la tarjeta del listado (ej. “Nuevo sellado”). |
| **Orden en listados** | Número para ordenar la posición en listados (según la lógica del sitio). |
| **Publicado** | Si está desmarcado, el producto **no se muestra** en la web. |

#### Paso Foto

| Campo | Qué significa |
|--------|----------------|
| **Archivo** | Imagen principal. En producto **nuevo** hace falta tener el **ID** ya cargado para habilitar bien la subida. |
| **Texto alternativo** | Descripción de la imagen (accesibilidad y buscadores). |

#### Paso Oferta (opcional)

| Campo | Qué significa |
|--------|----------------|
| **Precio anterior (tachado)** | Precio “antes” para mostrar promoción en la grilla. |
| **% de descuento** | Porcentaje que se muestra en la etiqueta de descuento. |

Si no aplican, usar **Saltar**.

#### Paso Variantes (opcional)

Solo si el cliente **elige** algo que cambia el precio (color, GB, talle, etc.): **grupos** de opciones, tipo de control y reglas de precio (precio final por opción o suma al precio base).

Si el producto es **un solo precio**, **Saltar** sin cargar grupos.

#### Paso Ficha (opcional)

Página larga del producto: más fotos, bullets, especificaciones, productos relacionados. Si lo saltan, la tienda puede mostrar una ficha **mínima** con los datos del catálogo.

#### Paso Listo (revisión)

Resumen de lo principal y botón **Guardar producto**. **Un solo guardado** envía catálogo + variantes + ficha.

El servidor valida categoría activa, imagen, textos obligatorios, etc. Si falla algo, el error aparece arriba del formulario.

---

### Modo “Una página”

Misma información que el asistente, organizada en **secciones** con el menú “Saltar a”. Un botón fijo **Guardar producto** guarda todo junto.

---

## Frase de cierre (para la reunión)

> El sitio es la **vidriera y el filtro**: categorías y precios en **USD** orientan al cliente; el **carrito** y el **formulario de servicio** le mandan el pedido listo por **WhatsApp**; ustedes cargan productos con el **asistente** para no perderse en campos que no aplican a cada caso.

---

## Notas operativas

- **Formulario de solicitud de servicio** en la web sigue activo; la edición avanzada del JSON puede hacerse por la clave de contenido **`repair.form`** en Supabase o flujo de **Contenido** si está disponible para esa clave.
- **Favoritos** no se sincronizan entre dispositivos: son locales al navegador.

---

*Documento alineado al proyecto El Garage de Steve. Actualizar si cambian rutas o módulos del backoffice.*
