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
            await supabase.auth.signOut(); // Log out non-admin user immediately
        }
    }
}

async function checkIfAdmin(userId) {
    if (!userId) return false;
    const { data, error } = await supabase
        .from('administradores')
        .select('user_id')
        .eq('user_id', userId)
        .single(); // Use .single() as we expect at most one row

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error here
        console.error('Error checking admin status:', error.message);
        return false;
    }
    return !!data; // Return true if data is not null
}

async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
    // The onAuthStateChange listener will handle the UI changes
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

// Listen for auth state changes to show/hide content
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
            // Optional: If a non-admin is somehow still signed in, log them out.
            await supabase.auth.signOut();
        }
    }
});

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
            console.error('Storage Upload Error:', error.message);
            return;
        }
        
        // Construct public URL
        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
        
        imageUrl = publicUrlData.publicUrl;

    }

    const { data, error: insertError } = await supabase
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

async function deleteProduct(productId, imageUrl) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    // First, delete the database record
    const { error: deleteDbError } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId);

    if (deleteDbError) {
        productMessage.textContent = `Error al eliminar producto: ${deleteDbError.message}`;
        productMessage.style.color = 'red';
        return;
    }

    // If database deletion is successful, delete the image from storage
    if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
            const { error: deleteImageError } = await supabase.storage
                .from('product-images')
                .remove([fileName]);

            if (deleteImageError) {
                // Log the error but don't block the user feedback, as the DB entry is gone
                console.error('Error deleting image from storage:', deleteImageError.message);
                productMessage.textContent = 'Producto eliminado de la base de datos, pero hubo un error al borrar la imagen del almacenamiento.';
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