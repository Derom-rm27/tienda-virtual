# DOCUMENTACION_PROYECTO.md - Tienda Virtual AMELI'S

¡Hola, colega! Aquí te explico cómo funciona tu tienda virtual AMELI'S, cómo la hemos montado y cómo puedes seguir usándola y actualizándola.

---

### ¿Qué es este proyecto?

Es una **Tienda Virtual** robusta, diseñada para mostrar productos de forma dinámica, permitir a los clientes agregar artículos a un carrito y, lo más importante, ofrecer un **panel de administración integrado** para que gestiones tus productos de forma sencilla y segura. Toda la información (productos, configuraciones y usuarios) se gestiona a través de tu base de datos en **Supabase**.

---

### ¿Cómo se conectó todo?

La magia de la conexión ocurre principalmente en el archivo `script.js` y con la ayuda de la librería de Supabase (Supabase.js). Ahora, con un sistema de roles más avanzado, funciona así:

1.  **Librería Supabase:** La línea `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` en `index.html` carga la herramienta oficial que permite que tu código web "hable" con tu base de datos de Supabase de forma segura.
2.  **Credenciales:** En la parte superior de `script.js`, se encuentran tu `SUPABASE_URL` y tu `SUPABASE_ANON_KEY`, que le indican a la librería de Supabase a qué proyecto conectarse.
3.  **Gestión de Datos:**
    *   **Productos:** La función `loadStoreData()` en `script.js` es la encargada de obtener todos los productos de tu tabla `public.productos`.
    *   **Configuración:** Consulta tu tabla `public.config` para valores como `PROMO_META` y `PROMO_BONO`.
    *   **Usuarios:** Ahora, al registrarse un usuario, Supabase lo guarda en su tabla interna `auth.users` y un **trigger automático** copia su `id` y `email` a tu nueva tabla `public.usuarios`.
    *   **Administradores:** Si un usuario tiene su `id` listado en tu tabla `public.administradores`, el sistema lo reconocerá como administrador.
4.  **Lógica de Acceso y Vistas Dinámicas:**
    *   Cuando un usuario inicia sesión, `script.js` verifica si su `user_id` está en la tabla `administradores`.
    *   Si **es administrador**, se le muestra el **Panel de Administración** (formularios para añadir/eliminar productos).
    *   Si **no es administrador** (o si nadie ha iniciado sesión), se muestra la **Tienda Virtual** normal (con el catálogo de productos y el carrito).

En resumen, ahora tu `index.html` es el punto de entrada para todos. El `script.js` se encarga de todo: autenticar al usuario, verificar su rol y mostrarle la interfaz adecuada (tienda o administración).

---

### Pasos de creación y modificaciones

Aquí te detallo lo que hemos hecho y por qué:

*   **`public.usuarios` (Tabla creada por ti en Supabase):**
    *   **¿Qué?** Creamos esta tabla con `id`, `email` y `created_at`.
    *   **¿Por qué?** Para tener un registro público de los usuarios de tu tienda, vinculado de forma segura con el sistema de autenticación de Supabase.
*   **`public.administradores` (Tabla creada por ti en Supabase):**
    *   **¿Qué?** Creamos esta tabla con `id` y `user_id`.
    *   **¿Por qué?** Esta es la clave para la seguridad. Solo los `user_id` presentes aquí tendrán acceso a las funciones de administración. Tú decides quién puede ser admin.
*   **Trigger `on_auth_user_created` (Función y Disparador en Supabase):**
    *   **¿Qué?** Configuramos una función en tu base de datos que se ejecuta automáticamente.
    *   **¿Por qué?** Para que cada vez que un nuevo usuario se registre en Supabase Auth, su `id` y `email` se inserten automáticamente en tu tabla `public.usuarios`.
*   **`index.html` (Modificado extensamente):**
    *   **¿Qué?** Se eliminó el `admin.html` independiente. Ahora `index.html` contiene tanto la estructura de la tienda como la del panel de administración, y un modal de autenticación (`#authModal`).
    *   **¿Por qué?** Para unificar la experiencia del usuario y permitir la renderización dinámica según el rol.
*   **`script.js` (Modificado y reescrito extensamente):**
    *   **¿Qué?**
        1.  Absorbió toda la lógica del antiguo `admin.js` (formularios, subida de imágenes, gestión de productos).
        2.  Implementa la lógica completa de autenticación (registro, login, logout) a través del modal.
        3.  Implementa la lógica de verificación de roles (`checkIfAdmin()`) consultando la tabla `administradores`.
        4.  Controla qué secciones de `index.html` se muestran (`showStore()` o `showAdminPanel()`) basándose en si el usuario es un administrador o no.
    *   **¿Por qué?** Para integrar de forma segura el panel de administración con la tienda principal y habilitar el control de acceso basado en roles.
*   **`style.css` (Modificado):**
    *   **¿Qué?** Añadimos estilos para el nuevo modal de autenticación y las secciones del panel de administración.
    *   **¿Por qué?** Para que la interfaz se vea bien y sea coherente en ambos modos (tienda y administración).
*   **`admin.html` y `admin.js` (Eliminados conceptualmente):**
    *   **¿Qué?** Ya no existen como archivos separados en tu proyecto.
    *   **¿Por qué?** Su funcionalidad se ha integrado completamente en `index.html` y `script.js`.

---

### Cómo actualizarlo

Actualizar tu tienda es bastante sencillo, especialmente con Supabase:

1.  **Productos y Configuraciones:**
    *   **Para cambiar productos:** Accede a tu panel de administración (iniciando sesión como admin en `index.html`) y usa el formulario de subida o las opciones de edición/eliminación. O, si lo prefieres, ve a tu panel de Supabase, selecciona la tabla `productos` y modifícalos directamente.
    *   **Para cambiar la meta de promoción (`meta`) o el bono (`bono`):** Ve a tu panel de Supabase, selecciona la tabla `config` y edita los valores en las filas correspondientes a 'meta' y 'bono'.
    *   **¡Importante!** Los cambios que hagas en Supabase o en el panel de administración se verán reflejados en tu tienda **automáticamente** en cuanto se recargue la página.

2.  **Gestión de Administradores:**
    *   Para que un usuario sea administrador, simplemente **inserta su `user_id` en la tabla `public.administradores` de Supabase**. Puedes obtener el `user_id` de cualquier usuario registrado en la tabla `auth.users` o `public.usuarios`.

3.  **Código (Diseño, Lógica, etc.):**
    *   Si quieres cambiar el **diseño** (colores, fuentes, disposición), edita el archivo `style.css`.
    *   Si quieres cambiar la **estructura de la página** (añadir nuevas secciones, mover elementos), edita el archivo `index.html`.
    *   Si quieres cambiar la **lógica** (cómo funciona el carrito, la búsqueda, la autenticación, etc.), edita el archivo `script.js`.
    *   **Para que los cambios de código se vean en línea:**
        *   Guarda los archivos modificados en tu computadora.
        *   **Sube estos cambios a tu repositorio de GitHub.** Si hemos configurado GitHub Pages, cada vez que subas cambios a la rama principal (generalmente `main`), GitHub Pages se actualizará automáticamente en unos minutos.

---
**¡Felicitaciones!** Ahora tienes una tienda virtual completa con integración de base de datos dinámica, un sistema de autenticación robusto y un panel de administración seguro basado en roles.