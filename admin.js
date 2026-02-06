// Supabase Configuration - Reusing main store credentials
const SUPABASE_URL = 'https://gsyncqjiktclkzytjrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeW5jcWppa3RjbGt6eXRqcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTkyMzEsImV4cCI6MjA4NTgzNTIzMX0.1t8xr5SKTPvMH9dOZCrQBxMkMPLqxcturwdwjetnJXU';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const authSection = document.getElementById('authSection');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authMessage = document.getElementById('authMessage');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessage = document.getElementById('welcomeMessage');

const productManagementSection = document.getElementById('productManagementSection');
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

// Check authentication status on load
supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
        // User is logged in
        showLoggedInView(session.user);
        loadProductsForAdmin();
    } else {
        // User is logged out
        showLoggedOutView();
    }
});

// --- Auth Functions ---
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = ''; // Clear previous messages
    const email = emailInput.value;
    const password = passwordInput.value;

    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    if (!signUpError) {
        // If signup was successful, try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            authMessage.textContent = `Error al iniciar sesión: ${signInError.message}`;
            console.error('Sign In Error:', signInError.message);
        } else {
            authMessage.textContent = '¡Bienvenido! Revisa tu email para verificar tu cuenta si es la primera vez.';
        }
    } else if (signUpError.message.includes('already registered')) {
        // If user already exists, try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            authMessage.textContent = `Error al iniciar sesión: ${signInError.message}`;
            console.error('Sign In Error:', signInError.message);
        }
    } else {
        authMessage.textContent = `Error al registrar/iniciar sesión: ${signUpError.message}`;
        console.error('Sign Up Error:', signUpError.message);
    }
});

logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
});

function showLoggedInView(user) {
    authSection.style.display = 'none';
    logoutBtn.style.display = 'block';
    productManagementSection.style.display = 'block';
    welcomeMessage.textContent = `Bienvenido, ${user.email} (Administrador)`;
}

function showLoggedOutView() {
    authSection.style.display = 'block';
    logoutBtn.style.display = 'none';
    productManagementSection.style.display = 'none';
    welcomeMessage.textContent = 'Bienvenido al Panel de Administración';
}

// --- Product Management Functions ---
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    productMessage.textContent = 'Subiendo producto...';
    productMessage.style.color = 'blue';

    const file = productImage.files[0];
    let imageUrl = '';

    if (file) {
        const filePath = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('product-images') // Assuming a bucket named 'product-images'
            .upload(filePath, file);

        if (error) {
            productMessage.textContent = `Error al subir imagen: ${error.message}`;
            productMessage.style.color = 'red';
            console.error('Storage Upload Error:', error.message);
            return;
        }
        imageUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;
    }

    const { data, error: insertError } = await supabase
        .from('productos')
        .insert([
            {
                nombre: productName.value,
                descripcion: productDescription.value,
                precio: parseFloat(productPrice.value),
                stock: parseInt(productStock.value),
                descuento: parseInt(productDiscount.value),
                categoria: productCategory.value.toLowerCase(),
                imagen: imageUrl,
                rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1), // Still random for admin, can be improved
                sold: Math.floor(Math.random() * 200) + 50 // Still random for admin, can be improved
            },
        ]);

    if (insertError) {
        productMessage.textContent = `Error al añadir producto: ${insertError.message}`;
        productMessage.style.color = 'red';
        console.error('Insert Product Error:', insertError.message);
    } else {
        productMessage.textContent = '¡Producto añadido con éxito!';
        productMessage.style.color = 'green';
        productForm.reset(); // Clear form
        loadProductsForAdmin(); // Reload product list
    }
});

async function loadProductsForAdmin() {
    currentProductsDiv.innerHTML = 'Cargando productos...';
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        currentProductsDiv.innerHTML = `Error al cargar productos: ${error.message}`;
        console.error('Load Admin Products Error:', error.message);
        return;
    }

    if (data.length === 0) {
        currentProductsDiv.innerHTML = '<p>No hay productos registrados.</p>';
        return;
    }

    let productsHtml = '<ul class="admin-product-list">';
    data.forEach(prod => {
        productsHtml += `
            <li>
                <img src="${prod.imagen || 'https://via.placeholder.com/50'}" alt="${prod.nombre}" width="50" height="50">
                <span>${prod.nombre} - S/${prod.precio.toFixed(2)} (${prod.stock} en stock)</span>
                <button onclick="deleteProduct('${prod.id}')" class="delete-btn"><i class="fas fa-trash"></i></button>
            </li>`;
    });
    productsHtml += '</ul>';
    currentProductsDiv.innerHTML = productsHtml;
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    // First, get the product to delete its image from storage
    const { data: productToDelete, error: fetchError } = await supabase
        .from('productos')
        .select('imagen')
        .eq('id', productId)
        .single();

    if (fetchError) {
        console.error('Error fetching product for image deletion:', fetchError.message);
        productMessage.textContent = `Error: ${fetchError.message}`;
        productMessage.style.color = 'red';
        return;
    }

    if (productToDelete && productToDelete.imagen) {
        const imageUrl = productToDelete.imagen;
        const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        const { error: deleteImageError } = await supabase.storage
            .from('product-images')
            .remove([fileName]);

        if (deleteImageError) {
            console.error('Error deleting image from storage:', deleteImageError.message);
            // Don't block product deletion if image deletion fails
        }
    }

    const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Error al eliminar producto:', error.message);
        productMessage.textContent = `Error al eliminar producto: ${error.message}`;
        productMessage.style.color = 'red';
    } else {
        productMessage.textContent = 'Producto eliminado con éxito.';
        productMessage.style.color = 'green';
        loadProductsForAdmin();
    }
}
