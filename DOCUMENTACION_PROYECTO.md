# DOCUMENTACION_PROYECTO.md - Tienda Virtual AMELI'S

¡Hola, colega! Aquí te explico cómo funciona tu tienda virtual AMELI'S, cómo la hemos montado y cómo puedes seguir usándola y actualizándola.

---

### ¿Qué es este proyecto?

Es una **Tienda Virtual** robusta y con dos interfaces claras:
1.  **Para Clientes:** Un `index.html` amigable para el público, donde pueden ver productos, usar el carrito y comprar.
2.  **Para Administradores:** Un `admin.html` separado y seguro, donde tú y otros administradores autorizados pueden gestionar productos (subir, eliminar).

Toda la información (productos, configuraciones, usuarios) se gestiona a través de tu base de datos en **Supabase**.

---

### ¿Cómo se conectó todo?

La magia de la conexión ocurre principalmente a través de la librería de Supabase (Supabase.js) en dos flujos separados:

#### 1. Flujo para Clientes (en `index.html`):

*   **Librería Supabase:** `index.html` carga `supabase.js`, la herramienta oficial para que tu código web se comunique con Supabase.
*   **Credenciales:** En `script.js`, se encuentran tu `SUPABASE_URL` y tu `SUPABASE_ANON_KEY`.
*   **Gestión de Datos:**
    *   **Productos y Configuración:** El `script.js` de `index.html` es el encargado de obtener todos los productos de tu tabla `public.productos` y la configuración (como `PROMO_META` y `PROMO_BONO`) de `public.config`.
    *   **Autenticación de Clientes:** Los clientes pueden registrarse e iniciar sesión. Supabase gestiona sus cuentas en `auth.users`, y un **trigger automático** copia su `id` y `email` a tu tabla `public.usuarios`. **Importante:** Un usuario registrado aquí es solo un cliente, no tiene acceso al panel de administración.
*   **Muestra en Pantalla:** Una vez que `script.js` tiene los datos, construye y muestra la tienda con el catálogo, la búsqueda y el carrito de compras.

#### 2. Flujo para Administradores (en `admin.html`):

*   **Librería Supabase:** `admin.html` también carga `supabase.js`.
*   **Credenciales:** En `admin.js`, se encuentran tus mismas `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
*   **Autenticación y Seguridad:**
    *   `admin.js` maneja un formulario de inicio de sesión **exclusivo para administradores**.
    *   Cuando un administrador intenta iniciar sesión, Supabase verifica sus credenciales.
    *   **Crucialmente:** Después de una autenticación exitosa, `admin.js` consulta tu tabla `public.administradores`. **Solo si el `user_id` del usuario que intenta iniciar sesión está presente en esta tabla, se le concederá acceso al panel.** De lo contrario, se cierra su sesión y se le niega el acceso.
*   **Gestión de Productos:** Una vez dentro, los administradores pueden usar los formularios para subir nuevos productos (con imágenes a Supabase Storage) y eliminar productos existentes.

---

### Pasos de creación y modificaciones

Aquí te detallo lo que hemos hecho y por qué:

*   **`public.usuarios` (Tabla creada por ti en Supabase):**
    *   **¿Qué?** Creamos esta tabla con `id`, `email` y `created_at`.
    *   **¿Por qué?** Para tener un registro público de los usuarios de tu tienda, vinculado de forma segura con el sistema de autenticación de Supabase.
*   **`public.administradores` (Tabla modificada por ti y por nosotros en Supabase):**
    *   **¿Qué?** Creamos esta tabla con `id`, `user_id` y `email`.
    *   **¿Por qué?** Es la clave para la seguridad del panel de administración. Solo los `user_id` presentes aquí (con su email para tu fácil identificación) tendrán acceso a las funciones de administración. Tú decides quién puede ser admin.
*   **Trigger `on_auth_user_created` (Función y Disparador en Supabase):**
    *   **¿Qué?** Configuramos una función en tu base de datos que se ejecuta automáticamente.
    *   **¿Por qué?** Para que cada vez que un nuevo usuario se registre en Supabase Auth, su `id` y `email` se inserten automáticamente en tu tabla `public.usuarios`.
*   **`index.html` (Reescrito):**
    *   **¿Qué?** Contiene solo la estructura de la tienda para el cliente y un modal de autenticación para que los clientes inicien sesión o se registren.
    *   **¿Por qué?** Para separar claramente la experiencia del cliente de la del administrador y evitar confusiones o accesos no deseados al panel de administración.
*   **`script.js` (Reescrito):**
    *   **¿Qué?** Maneja exclusivamente la lógica de la tienda (carga de productos, carrito, búsqueda, etc.) y la autenticación de clientes. **Toda la lógica de administración ha sido removida de aquí.**
    *   **¿Por qué?** Para mantener un código limpio y una clara separación de responsabilidades entre el cliente y el administrador.
*   **`admin.html` (Reescrito):**
    *   **¿Qué?** Es una página completamente separada con un formulario de inicio de sesión solo para administradores y el panel de gestión de productos.
    *   **¿Por qué?** Para proporcionar un punto de acceso seguro y dedicado para los administradores.
*   **`admin.js` (Reescrito):**
    *   **¿Qué?** Contiene la lógica exclusiva para el panel de administración: inicio de sesión de administrador, verificación de su rol, y todas las funciones para subir, listar y eliminar productos (incluyendo la gestión de imágenes en Supabase Storage).
    *   **¿Por qué?** Para implementar la lógica de acceso restringido y las funciones de gestión del inventario.
*   **`style.css` (Actualizado):**
    *   **¿Qué?** Añadimos estilos para los modales de autenticación de clientes y para las interfaces de administración.
    *   **¿Por qué?** Para asegurar que ambas interfaces se vean bien y sean responsivas.

---

### Cómo actualizarlo y gestionar administradores

Actualizar tu tienda y gestionar administradores es ahora más claro:

1.  **Productos y Configuraciones (a través del Panel de Administración):**
    *   **Para cambiar productos:** Ve a la URL de tu Panel de Administración (`admin.html`), inicia sesión como administrador y usa el formulario de subida o las opciones de edición/eliminación.
    *   **Para cambiar la meta de promoción (`meta`) o el bono (`bono`):** Ve a tu panel de Supabase, selecciona la tabla `config` y edita los valores en las filas correspondientes a 'meta' y 'bono'.
    *   **¡Importante!** Los cambios que hagas se verán reflejados en tu tienda **automáticamente**.

2.  **Gestión de Administradores (Manualmente en Supabase):**
    *   **Paso 1: La persona se registra como Cliente.** Primero, la persona que quieres que sea administrador debe registrarse como un cliente normal en la tienda (`index.html`). Esto creará su cuenta en Supabase `auth.users` y en `public.usuarios`.
    *   **Paso 2: Conviértelo en Administrador.**
        *   Ve a tu panel de Supabase y busca el `user_id` de esa persona en la tabla `auth.users` o `public.usuarios`.
        *   Luego, ve a la tabla `public.administradores` e **inserta manualmente** una nueva fila con el `user_id` y el `email` de esa persona.
    *   Una vez hecho esto, esa persona podrá iniciar sesión en `admin.html`.

3.  **Código (Diseño, Lógica, etc.):**
    *   Si quieres cambiar el **diseño general** o estilos, edita `style.css`.
    *   Si quieres cambiar la **estructura de la tienda** o la lógica de clientes, edita `index.html` y `script.js`.
    *   Si quieres cambiar la **estructura o lógica del panel de administración**, edita `admin.html` y `admin.js`.
    *   **Para que los cambios de código se vean en línea:**
        *   Guarda los archivos modificados en tu computadora.
        *   **Sube estos cambios a tu repositorio de GitHub.** Si hemos configurado GitHub Pages, cada vez que subas cambios a la rama principal (generalmente `main`), GitHub Pages se actualizará automáticamente en unos minutos.

---
**¡Felicitaciones!** Ahora sí, tienes una tienda virtual con una arquitectura limpia, un sistema de autenticación robusto para clientes y un panel de administración seguro y dedicado.
