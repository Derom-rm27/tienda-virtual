// Supabase Configuration
const SUPABASE_URL = 'https://gsyncqjiktclkzytjrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeW5jcWppa3RjbGt6eXRqcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTkyMzEsImV4cCI6MjA4NTgzNTIzMX0.1t8xr5SKTPvMH9dOZCrQBxMkMPLqxcturwdwjetnJXU';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const adminLoginSection = document.getElementById('adminLoginSection');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminContent = document.getElementById('adminContent');
const adminWelcomeMessage = document.getElementById('adminWelcomeMessage');
const logoutBtn = document.getElementById('logoutBtn');

// User Creation DOM Elements
const createUserForm = document.getElementById('createUserForm');
const newUserEmailInput = document.getElementById('newUserEmail');
const newUserPasswordInput = document.getElementById('newUserPassword');
const isNewUserAdminCheckbox = document.getElementById('isNewUserAdmin');
const createUserMessage = document.getElementById('createUserMessage');

// Product Management DOM Elements
const productForm = document.getElementById('productForm');
const productName = document.getElementById('productName');
const productDescription = document.getElementById('productDescription');
const productPrice = document.getElementById('productPrice');
const productStock = document.getElementById('productStock');
const productDiscount = document.getElementById('productDiscount');
const productCategory = document.getElementById('productCategory');
const productImage = document.getElementById('productImage');
const productMessage = document.getElementById('productMessage');
const currentProductsDiv = document.getElementById('currentProducts');

// --- Auth Handling ---
async function handleAdminLogin(e) {
    e.preventDefault();
    adminLoginMessage.textContent = 'Verificando...';
    const email = adminEmailInput.value;
    const password = adminPasswordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        adminLoginMessage.textContent = `Error: ${error.message}`;
        return;
    }

    if (data.user) {
        const isAdmin = await checkIfAdmin(data.user.id);
        if (isAdmin) {
            showAdminPanel(data.user);
        } else {
            adminLoginMessage.textContent = 'Acceso denegado. No eres un administrador.';
            await supabase.auth.signOut();
        }
    }
}

async function checkIfAdmin(userId) {
    if (!userId) return false;
    const { data, error } = await supabase
        .from('administradores')
        .select('user_id')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error.message);
        return false;
    }
    return !!data;
}

async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error.message);
}

function showAdminLogin() {
    adminLoginSection.style.display = 'block';
    adminContent.style.display = 'none';
    logoutBtn.style.display = 'none';
}

function showAdminPanel(user) {
    adminLoginSection.style.display = 'none';
    adminContent.style.display = 'block';
    logoutBtn.style.display = 'block';
    adminWelcomeMessage.textContent = `Bienvenido, ${user.email}`;
    loadProductsForAdmin();
}

supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
        showAdminLogin();
        return;
    }
    if (session) {
        const isAdmin = await checkIfAdmin(session.user.id);
        if (isAdmin) {
            showAdminPanel(session.user);
        } else {
            showAdminLogin();
            await supabase.auth.signOut();
        }
    }
});

// --- User Creation Function ---
async function handleCreateUser(e) {
    e.preventDefault();
    createUserMessage.textContent = 'Creando usuario...';
    createUserMessage.style.color = 'blue';

    const email = newUserEmailInput.value;
    const password = newUserPasswordInput.value;
    const makeAdmin = isNewUserAdminCheckbox.checked;

    // This uses a special admin-only function. For this to work, you'd typically need a
    // secure server-side environment. However, we can simulate it for now.
    // IMPORTANT: The user will be created, but making them an admin from the client-side
    // is only possible because the 'administradores' table has open write permissions.
    // This is NOT secure for a production environment.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (authError) {
        createUserMessage.textContent = `Error al crear usuario: ${authError.message}`;
        createUserMessage.style.color = 'red';
        return;
    }

    if (authData.user) {
        let message = '¡Usuario cliente creado con éxito!';
        
        // If the "make admin" checkbox is checked, add them to the 'administradores' table
        if (makeAdmin) {
            const { error: adminError } = await supabase
                .from('administradores')
                .insert([{ user_id: authData.user.id }]);
            
            if (adminError) {
                message = `Usuario creado, pero no se pudo asignar como admin: ${adminError.message}`;
                createUserMessage.style.color = 'orange';
            } else {
                message = '¡Usuario administrador creado con éxito!';
            }
        }
        
        createUserMessage.textContent = message;
        createUserMessage.style.color = 'green';
        createUserForm.reset();
    }
}

// --- Product Management Functions ---
async function handleProductFormSubmit(e) {
    e.preventDefault();
    productMessage.textContent = 'Subiendo producto...';
    productMessage.style.color = 'blue';

    const file = productImage.files[0];
    let imageUrl = '';

    if (file) {
        const filePath = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (error) {
            productMessage.textContent = `Error al subir imagen: ${error.message}`;
            productMessage.style.color = 'red';
            return;
        }
        
        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
        
        imageUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabase
        .from('productos')
        .insert([{
            nombre: productName.value,
            descripcion: productDescription.value,
            precio: parseFloat(productPrice.value),
            stock: parseInt(productStock.value),
            descuento: parseInt(productDiscount.value),
            categoria: productCategory.value.toLowerCase(),
            imagen: imageUrl
        }]);

    if (insertError) {
        productMessage.textContent = `Error al añadir producto: ${insertError.message}`;
        productMessage.style.color = 'red';
    } else {
        productMessage.textContent = '¡Producto añadido con éxito!';
        productMessage.style.color = 'green';
        productForm.reset();
        await loadProductsForAdmin();
    }
}

async function loadProductsForAdmin() {
    currentProductsDiv.innerHTML = 'Cargando productos...';
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        currentProductsDiv.innerHTML = `<p style="color:red;">Error al cargar productos: ${error.message}</p>`;
        return;
    }

    if (data.length === 0) {
        currentProductsDiv.innerHTML = '<p>No hay productos registrados.</p>';
        return;
    }

    currentProductsDiv.innerHTML = `
        <ul class="admin-product-list">
            ${data.map(prod => `
                <li>
                    <img src="${prod.imagen || 'https://via.placeholder.com/50'}" alt="${prod.nombre}" width="50" height="50">
                    <span>${prod.nombre} - S/ ${prod.precio.toFixed(2)} (${prod.stock} en stock)</span>
                    <button onclick="deleteProduct('${prod.id}', '${prod.imagen}')" class="delete-btn" title="Eliminar Producto"><i class="fas fa-trash"></i></button>
                </li>
            `).join('')}
        </ul>
    `;
}

window.deleteProduct = async function(productId, imageUrl) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    const { error: deleteDbError } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId);

    if (deleteDbError) {
        productMessage.textContent = `Error al eliminar producto: ${deleteDbError.message}`;
        productMessage.style.color = 'red';
        return;
    }

    if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
            const { error: deleteImageError } = await supabase.storage
                .from('product-images')
                .remove([fileName]);

            if (deleteImageError) {
                console.error('Error deleting image from storage:', deleteImageError.message);
                productMessage.textContent = 'Producto eliminado, pero hubo un error al borrar la imagen.';
                productMessage.style.color = 'orange';
            }
        }
    }
    
    if (!productMessage.textContent.includes('error')) {
        productMessage.textContent = 'Producto eliminado con éxito.';
        productMessage.style.color = 'green';
    }
    
    await loadProductsForAdmin();
}

// Initial Event Listeners
adminLoginForm.addEventListener('submit', handleAdminLogin);
logoutBtn.addEventListener('click', logoutUser);
productForm.addEventListener('submit', handleProductFormSubmit);
createUserForm.addEventListener('submit', handleCreateUser);