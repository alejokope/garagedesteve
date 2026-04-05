# El Garage de Steve — Documentación para presentación con el cliente

Documento pensado para **armar diapositivas** o usar como **guion**. Cada bloque puede ser 1 slide o varias.

---

## Slide 1 — Título

**El Garage de Steve**  
Sitio web + panel de administración

- Catálogo de productos Apple y accesorios  
- Servicio técnico con precios y solicitud de reparación  
- Contenido de la home editable sin código  
- **Precios en USD** en tienda y flujos principales  
- Cierre de ventas y consultas por **WhatsApp** (sin pasarela de pago en la web)

---

## Slide 2 — Qué resuelve el proyecto

**Para el visitante**

- Ver productos con filtros (categoría, marca, precio, condición, etc.)  
- Guardar **favoritos** en el navegador  
- Armar un **carrito** y enviar el pedido por WhatsApp  
- Consultar **reparaciones** y **precios de servicio técnico**  
- Completar **solicitud de servicio** (modelo, problema, prioridad, entrega)

**Para el negocio**

- Actualizar **productos, textos y precios** desde un panel privado  
- Mantener coherencia entre lo que se muestra y lo que se cotiza por chat  
- Reducir dependencia de desarrolladores para cambios del día a día

---

## Slide 3 — Mapa del sitio público (visitante)

| Sección | Ruta aproximada | Qué muestra |
|--------|------------------|-------------|
| Inicio | `/` | Hero, categorías, destacados, servicio técnico, testimonios, FAQ, CTA (según contenido cargado) |
| Tienda / Catálogo | `/tienda` | Listado con filtros, paginación, orden |
| Ficha de producto | `/tienda/[id]` | Fotos, precio, variantes (si hay), descripción, WhatsApp |
| Carrito | `/carrito` | Ítems, cantidades, total en USD, botón a WhatsApp |
| Favoritos | `/favoritos` | Lista guardada en el dispositivo |
| Servicio técnico | `/servicio-tecnico` | Entrada al servicio |
| Precios reparaciones | `/servicio-tecnico/precios` | Tablas, filtros, textos legales/acordeón |
| Solicitud de reparación | `/servicio-tecnico/solicitud` | Formulario → mensaje a WhatsApp |
| Seguimiento (si está publicado) | `/servicio-tecnico/reparaciones` | Consulta por código |
| Vende tu equipo | `/vende-tu-equipo` | Landing de compra de usados |

*Las URLs exactas pueden ajustarse; la idea es la estructura funcional.*

---

## Slide 4 — Cómo compra el cliente (flujo)

1. Navega el **catálogo** y entra a un producto.  
2. Si hay **variantes** (color, almacenamiento, etc.), elige opciones y ve el precio correspondiente (**USD**).  
3. **Agregar al carrito** o **guardar en favoritos** (favoritos = solo en ese navegador/dispositivo).  
4. En **Carrito**, revisa subtotal y lee el aviso de que el valor final se confirma por WhatsApp.  
5. **Finalizar por WhatsApp**: se abre un mensaje prearmado con el listado y el total orientativo.  
6. El equipo cierra **disponibilidad, retiro y forma de pago** por chat.

**Mensaje clave para el cliente final:** la web **no cobra**; **informa y acerca** al WhatsApp.

---

## Slide 5 — Moneda y precios (USD)

- En **tienda**, **carrito**, **ficha** y **favoritos** los importes se muestran en **dólares estadounidenses (USD)**.  
- **Servicio técnico** (tablas y formulario de solicitud) está pensado por defecto en **USD**; el panel permite casos puntuales o datos históricos en otra moneda si hiciera falta.  
- Los números en base de datos son los que ustedes cargan: **cambiar de “pesos” a “dólares” implica revisar valores**, no solo el símbolo.

---

## Slide 6 — Panel de administración (Backoffice)

**Acceso**

- URL interna de administración (ej. `/backoffice`)  
- **Login** protegido; solo personal autorizado

**Bloques principales del panel**

1. **Contenido** — secciones de la home y entradas de texto/JSON guiado  
2. **Productos** — catálogo completo  
3. **Listas del catálogo** — categorías, tipos de opción, modos de precio  
4. **Servicio técnico — Precios** — tablas públicas de reparaciones  
5. **Servicio técnico — Solicitud** — textos y opciones del formulario público  
6. **Reparaciones** (interno) — gestión de órdenes/códigos si lo usan operativamente

---

## Slide 7 — Productos: qué se puede configurar

**Datos esenciales (siempre)**

- ID del producto (fijo después de crear; define URL y carpeta de imágenes)  
- Nombre, resumen corto, marca opcional  
- **Categoría** del catálogo (iPhone, iPad, etc.)  
- **Precio base en USD**  
- Condición (nuevo / usado / sin etiqueta), badge opcional, orden en listados  
- **Publicado** sí/no  
- Imagen principal y texto alternativo  
- Oferta opcional: precio tachado + % de descuento

**Variantes (solo si aplica)**

- Grupos: ej. Color, Almacenamiento  
- Tipo de control (cómo se ve en la tienda)  
- Modo de precio: precio final por opción o suma al precio base  
- Listado de opciones con montos en **USD**

**Ficha larga (opcional)**

- Galería adicional, bullets, especificaciones  
- Productos relacionados / sugeridos  

**Guardado:** un solo botón **Guardar producto** envía todo el formulario.

---

## Slide 8 — Categorías vs variantes (concepto clave)

**Categoría**

- Es **dónde aparece** el producto en el catálogo (filtro principal).  
- Se administra en **Listas → Categorías**.  
- Ejemplo: “iPhone”, “AirPods”.

**Variantes**

- Son **opciones del mismo producto** que el cliente elige en la ficha.  
- Ejemplo: color Negro vs Blanco, 128 GB vs 256 GB.  
- Se configuran **dentro del producto**, bloque “Variantes”.

*Confundir ambas cosas es el error más común; en la documentación interna del panel ya está explicado.*

---

## Slide 9 — Listas del catálogo (Backoffice)

| Lista | Para qué sirve |
|-------|----------------|
| **Categorías** | Crear/editar las secciones del catálogo; activar o desactivar |
| **Tipos de opción** | Comportamiento visual de las variantes (lista, color, etc.) — no hace falta tocarlo en cada producto salvo casos especiales |
| **Modos de precio** | Etiquetas/ayuda para cómo se calcula el precio en variantes |

---

## Slide 10 — Contenido de la home (CMS)

Desde **Contenido** se editan bloques como (según lo que esté habilitado en el proyecto):

- Hero principal  
- Categorías destacadas  
- Productos destacados  
- Bloque servicio técnico  
- Por qué elegirnos / beneficios  
- Testimonios  
- FAQ  
- Cierre / CTA final  
- **Footer** (textos, columnas, redes)

Objetivo: **cambiar textos e imágenes** sin programador, con formularios o editores por sección.

---

## Slide 11 — Servicio técnico en la web pública

**Página de precios**

- Tablas por tipo de reparación  
- Filtro por dispositivo / modelo (según configuración)  
- Textos de garantía, tiempos, medios de pago (editables desde el panel)  
- Llamado a **WhatsApp**

**Formulario de solicitud**

- Tipo de servicio, marca, modelo, descripción del problema  
- Prioridad, forma de entrega  
- Datos de contacto  
- Al enviar: **mensaje listo para WhatsApp** (misma lógica que el carrito: la web no cobra)

---

## Slide 12 — Reparaciones (uso interno)

- Listado y alta/edición de **órdenes de reparación** (códigos, estados, fechas, etc.)  
- Pensado para **operación del taller**, no para el comprador casual  
- La página pública de **seguimiento** (si está activa) permite al cliente consultar con un código

*Ajustar el discurso según si el cliente usa hoy este módulo o lo activará más adelante.*

---

## Slide 13 — Infraestructura (resumen no técnico)

- **Sitio:** aplicación web moderna (rápida, adaptable a celular).  
- **Datos:** base en la nube (**Supabase**): productos, contenido, configuraciones.  
- **Imágenes:** almacenamiento en la nube vinculado al producto.  
- **WhatsApp:** número y nombre de negocio configurables por variables de entorno (no visibles en el panel para el usuario final).

*Si la audiencia es técnica, se puede añadir: Next.js, despliegue, entornos, backups.*

---

## Slide 14 — Limitaciones y responsabilidades claras

**Qué hace el sistema**

- Muestra información actualizada que ustedes cargan  
- Facilita el contacto por WhatsApp con mensajes estructurados  

**Qué no reemplaza**

- Facturación electrónica integrada  
- Stock en tiempo real multicanal (salvo que se integre otro sistema)  
- Pasarela de pago en la web  

**Favoritos**

- Se guardan **solo en el navegador** del usuario; si borra datos o cambia de celular, puede perder la lista.

---

## Slide 15 — Próximos pasos sugeridos (conversación con el cliente)

1. Revisar **precios en USD** en base de datos vs. política comercial real.  
2. Definir **textos legales** y políticas (envíos, garantías) visibles en web y WhatsApp.  
3. Capacitar a 1–2 personas en **alta de producto** y **edición de contenido**.  
4. Acordar **ritmo de actualización** (quién publica, quién responde WhatsApp).  
5. Lista de **mejoras futuras** (si las hay): newsletter, stock, integración ERP, etc.

---

## Anexo A — Checklist “alta de producto” (para repartir)

1. ¿Existe la **categoría** en Listas → Categorías? Si no, crearla.  
2. Productos → **Nuevo** → completar Paso 1 (ID, nombre, categoría, precio USD, imagen, publicado).  
3. **Guardar** y verificar en `/tienda` y en la ficha.  
4. Si hay **variantes**, completar Paso 2 y guardar de nuevo.  
5. Opcional: enriquecer **ficha** (Paso 3).

---

## Anexo B — Frases listas para el cierre de la presentación

- “La web es su **vidriera y asistente de ventas**; el cierre sigue siendo **humano por WhatsApp**.”  
- “Ustedes **controlan catálogo y textos**; nosotros mantenemos la **plataforma estable y segura**.”  
- “Todo lo que ven los clientes en **precios de productos** está pensado en **USD** para alinear expectativa con cotización.”

---

*Documento generado para el proyecto El Garage de Steve. Actualizar fechas y nombres de módulos si el despliegue difiere.*
