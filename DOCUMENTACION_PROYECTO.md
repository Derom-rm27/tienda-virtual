# DOCUMENTACION_PROYECTO.md - Tienda Virtual AMELI'S

¡Hola, colega! Aquí te explico cómo funciona tu tienda virtual AMELI'S, cómo la hemos montado y cómo puedes seguir usándola y actualizándola.

---

### ¿Qué es este proyecto?

Es una **Tienda Virtual** sencilla, diseñada para mostrar productos de forma dinámica y permitir a tus clientes agregar artículos a un carrito. Lo especial es que ahora la tienda obtiene toda la información de tus productos y configuraciones directamente desde tu base de datos en **Supabase**, en lugar de usar hojas de cálculo externas. Esto la hace más robusta y fácil de gestionar.

---

### ¿Cómo se conectó todo?

La magia de la conexión ocurre principalmente en el archivo `script.js` y con la ayuda de la librería de Supabase (Supabase.js). Aquí te lo detallo:

1.  **Librería Supabase:** Hemos añadido una línea especial en tu `index.html` para cargar `supabase.js`. Esta es la herramienta oficial que permite que tu código web "hable" con tu base de datos de Supabase de forma segura.
2.  **Credenciales:** En la parte superior de `script.js`, ahora encontrarás tu `SUPABASE_URL` y tu `SUPABASE_ANON_KEY`. Estos son como el usuario y la contraseña que le dicen a la librería de Supabase a qué proyecto conectarse.
3.  **Obteniendo Productos:** La función `loadStoreData()` en `script.js` es la encargada de ir a Supabase. Allí, le pide todos los productos a tu tabla `public.productos` (`.from('productos').select('*')`). Una vez que recibe los datos, los organiza y los muestra en la página principal de la tienda.
4.  **Obteniendo Configuración:** De manera similar, la misma función `loadStoreData()` también consulta tu nueva tabla `public.config` para obtener valores importantes como `PROMO_META` y `PROMO_BONO`. Esto significa que si cambias esos valores en Supabase, la tienda reflejará los cambios automáticamente.
5.  **Muestra en Pantalla:** Una vez que `script.js` tiene todos los datos (productos y configuración), utiliza funciones como `renderProducts()` para construir las tarjetas de los productos y mostrarlas en la sección correspondiente de tu `index.html`.

En resumen, cuando alguien abre tu tienda, el `script.js` se conecta a Supabase, descarga los productos y la configuración, y luego usa esa información para construir y mostrar la tienda tal como la ves.

---

### Pasos de creación y modificaciones

Aquí te detallo lo que hemos hecho y por qué:

*   **`index.html` (Modificado):**
    *   **¿Qué?** Añadimos la línea `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` justo antes de tu `script.js`.
    *   **¿Por qué?** Para que tu navegador cargue la librería de Supabase, que es esencial para que tu `script.js` pueda interactuar con tu base de datos de Supabase.

*   **`script.js` (Modificado):**
    *   **¿Qué?**
        1.  Eliminamos las constantes y llamadas a la API de `opensheet.elk.sh` (la conexión a Google Sheets).
        2.  Añadimos las constantes `SUPABASE_URL` y `SUPABASE_ANON_KEY` con tus credenciales y la inicialización del cliente de Supabase (`const supabase = Supabase.createClient(...)`).
        3.  Reescribimos la función `loadStoreData()` para que ahora obtenga los productos de la tabla `productos` y la configuración de la tabla `config` en Supabase.
        4.  Nos aseguramos de que los datos obtenidos de Supabase se procesen correctamente para que el resto de tu código (como el carrito, el detalle de producto, etc.) siga funcionando sin problemas.
    *   **¿Por qué?** Para migrar la fuente de datos de tu tienda de Google Sheets a tu base de datos de Supabase, haciéndola más escalable y robusta. Ahora toda la lógica de tu tienda se alimenta directamente de Supabase.

*   **`DOCUMENTACION_PROYECTO.md` (Creado):**
    *   **¿Qué?** Este archivo que estás leyendo ahora mismo.
    *   **¿Por qué?** Para dejar constancia de todo el proceso, las decisiones tomadas y para que tengas una guía clara para el futuro.

*   **`public.config` (Tabla creada por ti en Supabase):**
    *   **¿Qué?** Creamos esta tabla en tu base de datos de Supabase con las columnas `dato` y `valor`.
    *   **¿Por qué?** Para almacenar de forma dinámica la configuración de promociones (`meta` y `bono`), que antes venían de una hoja de cálculo. Así, puedes cambiar estos valores desde Supabase directamente.

---

### Cómo actualizarlo

Actualizar tu tienda es bastante sencillo, especialmente con Supabase:

1.  **Productos y Configuraciones:**
    *   **Para cambiar productos:** Ve a tu panel de Supabase, selecciona la tabla `productos` y modifica los campos (`nombre`, `precio`, `stock`, `imagen`, etc.) directamente allí.
    *   **Para cambiar la meta de promoción (`meta`) o el bono (`bono`):** Ve a tu panel de Supabase, selecciona la tabla `config` y edita los valores en las filas correspondientes a 'meta' y 'bono'.
    *   **¡Importante!** Los cambios que hagas en Supabase se verán reflejados en tu tienda **automáticamente** en cuanto se recargue la página.

2.  **Código (Diseño, Lógica, etc.):**
    *   Si quieres cambiar el **diseño** (colores, fuentes, disposición), edita el archivo `style.css`.
    *   Si quieres cambiar la **estructura de la página** (añadir nuevas secciones, mover elementos), edita el archivo `index.html`.
    *   Si quieres cambiar la **lógica** (cómo funciona el carrito, la búsqueda, etc.), edita el archivo `script.js`.
    *   **Para que los cambios de código se vean en línea:**
        *   Guarda los archivos modificados en tu computadora.
        *   **Sube estos cambios a tu repositorio de GitHub.** Si hemos configurado GitHub Pages, cada vez que subas cambios a la rama principal (generalmente `main` o `master`), GitHub Pages se actualizará automáticamente en unos minutos. Te daremos instrucciones más precisas sobre esto cuando lo configuremos.

---
**¡Listo!** Con esto, tu tienda está integrada con Supabase y lista para ser desplegada.

---

### Panel de Administración (para subir productos desde el celular)

Hemos creado una interfaz sencilla para que puedas gestionar tus productos (subir nuevos y eliminar existentes) desde cualquier dispositivo, incluido tu celular.

**Acceso al Panel:**

*   **URL:** Accede a `https://Derom-rm27.github.io/tienda-virtual/admin.html` (o la URL de tu sitio de GitHub Pages seguido de `/admin.html`).
*   **Autenticación:**
    *   Usa el correo y la contraseña que registraste en Supabase.
    *   Si es tu primera vez, Supabase te pedirá verificar tu correo electrónico.

**Funcionalidades:**

1.  **Inicio de Sesión / Registro:** Al acceder al `admin.html`, lo primero que verás es un formulario para iniciar sesión o registrarte. Si ya tienes una cuenta en Supabase (la que usaste para configurar la autenticación), simplemente inicia sesión. Si no, puedes registrarte allí mismo.
2.  **Subida de Productos:** Una vez que hayas iniciado sesión, verás un formulario para "Subir Nuevo Producto":
    *   **Nombre del Producto:** Nombre principal.
    *   **Descripción:** Detalles del producto.
    *   **Precio:** Precio de venta.
    *   **Stock:** Cantidad disponible.
    *   **Descuento:** Porcentaje de descuento (si aplica, por ejemplo, 10 para 10%).
    *   **Categoría:** Para organizar tus productos (ej. "Ropa", "Accesorios").
    *   **Imagen:** Puedes seleccionar una imagen desde tu dispositivo. Esta se subirá a **Supabase Storage** en el bucket `product-images`.
    *   Al hacer clic en "Añadir Producto", la información se guardará en tu tabla `public.productos` y la imagen se asociará.
3.  **Gestión de Productos Actuales:** Debajo del formulario de subida, verás una lista de tus productos actuales. Cada producto tiene una imagen, nombre, precio y stock.
    *   **Eliminar Producto:** Al lado de cada producto, hay un botón de papelera (<i class="fas fa-trash"></i>) que te permite eliminar el producto de la base de datos y su imagen del almacenamiento.

**Consideraciones de Seguridad (RLS):**

*   Para que la subida de imágenes funcione, configuramos un bucket llamado `product-images` en Supabase Storage.
*   También establecimos políticas de seguridad (RLS):
    *   `Allow public read access`: Permite que cualquiera (incluida tu tienda) vea las imágenes.
    *   `Allow authenticated upload`: Permite que cualquier usuario autenticado (como tú en el panel de admin) suba y elimine imágenes y productos. Esto significa que **cualquier usuario que se registre podrá subir/borrar productos**. Si deseas restringir esto a un usuario específico, deberíamos ajustar la política RLS para que solo tu ID de usuario (UID) tenga esos permisos.

---
**¡Felicitaciones!** Ahora tienes una tienda virtual completa con integración de base de datos dinámica y un panel de administración para gestionar tus productos.

