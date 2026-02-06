// Supabase Configuration
const SUPABASE_URL = 'https://gsyncqjiktclkzytjrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeW5jcWppa3RjbGt6eXRqcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTkyMzEsImV4cCI6MjA4NTgzNTIzMX0.1t8xr5SKTPvMH9dOZCrQBxMkMPLqxcturwdwjetnJXU';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global Variables for Store Data
let PROMO_META = 99999;
let PROMO_BONO = 0;
let allProducts = [], cart = [];
let currentDetailProd = null;

// DOM Elements - Common
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const authModal = document.getElementById('authModal');
const authModalForm = document.getElementById('authModalForm');
const authEmailInput = document.getElementById('authEmail');
const authPasswordInput = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authModalMessage = document.getElementById('authModalMessage');
const toggleAuthModeBtn = document.getElementById('toggleAuthMode');

// DOM Elements - Store Specific
const storeContent = document.getElementById('storeContent');
const storeFlashBanner = document.getElementById('storeFlashBanner');
const storeSearchBar = document.getElementById('storeSearchBar');
const countdownElement = document.getElementById('countdown');
const dynamicCategories = document.getElementById('dynamicCategories');
const productsGrid = document.getElementById('productsGrid');
const productDetailModal = document.getElementById('productDetailModal');
const detailImg = document.getElementById('detailImg');
const detailTitle = document.getElementById('detailTitle');
const detailPrice = document.getElementById('detailPrice');
const detailDesc = document.getElementById('detailDesc');
const detailSold = document.getElementById('detailSold');
const detailStock = document.getElementById('detailStock');
const detailBtn = document.getElementById('detailBtn');
const searchInput = document.getElementById('searchInput');

// DOM Elements - Admin Specific
const adminContent = document.getElementById('adminContent');
const adminWelcomeMessage = document.getElementById('adminWelcomeMessage');
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

let isSignUpMode = false; // Flag for authentication modal

// --- Initial Setup and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial check for authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthStateChange(session);
    });
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    handleAuthStateChange(session);
});

// Authentication Modal Events
authModalForm.addEventListener('submit', handleAuthSubmit);
toggleAuthModeBtn.addEventListener('click', toggleAuthMode);
logoutBtn.addEventListener('click', logoutUser);

// Admin Product Form Event
productForm.addEventListener('submit', handleProductFormSubmit);

// Global countdown for flash banner
setInterval(() => {
    const d = new Date();
    if (countdownElement) {
        countdownElement.innerHTML = `Termina en: <span>${23 - d.getHours()}</span>:<span>${59 - d.getMinutes()}</span>:<span>${59 - d.getSeconds()}</span>`;
    }
}, 1000);

// --- Auth Handling ---
async function handleAuthStateChange(session) {
    if (session) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userEmailDisplay.textContent = session.user.email;
        userEmailDisplay.style.display = 'inline';
        closeAuthModal();
        
        const isAdmin = await checkIfAdmin(session.user.id);
        if (isAdmin) {
            showAdminPanel(session.user);
        } else {
            showStore();
        }
    } else {
        showStore();
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userEmailDisplay.style.display = 'none';
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    authModalMessage.textContent = '';
    const email = authEmailInput.value;
    const password = authPasswordInput.value;

    if (isSignUpMode) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            authModalMessage.textContent = `Error al registrar: ${error.message}`;
            console.error('Sign Up Error:', error.message);
        } else {
            authModalMessage.textContent = '¡Registro exitoso! Revisa tu email para verificar la cuenta.';
            authModalMessage.style.color = 'green';
            isSignUpMode = false; // Switch to login mode after signup attempt
            toggleAuthModeBtn.textContent = '¿No tienes cuenta? Regístrate';
            authSubmitBtn.textContent = 'Iniciar Sesión';
        }
    } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            authModalMessage.textContent = `Error al iniciar sesión: ${error.message}`;
            console.error('Sign In Error:', error.message);
        }
    }
}

async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
    // handleAuthStateChange will be triggered by onAuthStateChange listener
}

function openAuthModal() {
    authModal.style.display = 'flex';
    authModalMessage.textContent = '';
    authModalForm.reset();
    isSignUpMode = false;
    authSubmitBtn.textContent = 'Iniciar Sesión';
    toggleAuthModeBtn.textContent = '¿No tienes cuenta? Regístrate';
}

function closeAuthModal() {
    authModal.style.display = 'none';
}

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    authSubmitBtn.textContent = isSignUpMode ? 'Registrarse' : 'Iniciar Sesión';
    toggleAuthModeBtn.textContent = isSignUpMode ? '¿Ya tienes cuenta? Iniciar Sesión' : '¿No tienes cuenta? Regístrate';
    authModalMessage.textContent = '';
}

async function checkIfAdmin(userId) {
    if (!userId) return false;
    const { count, error } = await supabase
        .from('administradores')
        .select('user_id', { count: 'exact' })
        .eq('user_id', userId);

    if (error) {
        console.error('Error checking admin status:', error.message);
        return false;
    }
    return count > 0;
}

function showStore() {
    document.body.classList.remove('admin-page'); // Remove admin-specific body class
    storeContent.style.display = 'grid'; // Store uses grid layout
    adminContent.style.display = 'none';
    storeFlashBanner.style.display = 'flex';
    storeSearchBar.style.display = 'flex';
    // Ensure store data is loaded
    loadStoreData();
}

function showAdminPanel(user) {
    document.body.classList.add('admin-page'); // Add admin-specific body class
    storeContent.style.display = 'none';
    adminContent.style.display = 'block'; // Admin uses block layout
    storeFlashBanner.style.display = 'none';
    storeSearchBar.style.display = 'none';
    adminWelcomeMessage.textContent = `Bienvenido, ${user.email} (Administrador)`;
    loadProductsForAdmin();
}

// --- Store Specific Logic (mostly unchanged, integrated) ---
async function loadStoreData() {
    try {
        const { data: productsData, error: productsError } = await supabase
            .from('productos')
            .select('*');

        if (productsError) {
            console.error('Error fetching products:', productsError);
            return;
        }

        const { data: configData, error: configError } = await supabase
            .from('config')
            .select('dato, valor');

        if (configError) {
            console.warn('Error fetching config:', configError);
        } else {
            configData.forEach(r => {
                if (r.dato === 'meta') PROMO_META = parseFloat(r.valor);
                if (r.dato === 'bono') PROMO_BONO = parseFloat(r.valor);
            });
        }

        allProducts = productsData.map(item => ({
            ...item,
            precio: parseFloat(item.precio) || 0,
            stock: parseInt(item.stock) || 0,
            descuento: parseInt(item.descuento) || 0,
            categoria: item.categoria ? item.categoria.toLowerCase() : 'varios',
            descripcion: item.descripcion || "Sin descripción disponible.",
            rating: parseFloat(item.rating) || (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1),
            sold: parseInt(item.sold) || Math.floor(Math.random() * 200) + 50
        }));
        
        generateCategories();
        renderProducts(allProducts);
    } catch (e) {
        console.error('Unhandled error in loadStoreData:', e);
    }
}

function generateCategories() {
    const cats = ['todos', ...new Set(allProducts.map(p => p.categoria))];
    dynamicCategories.innerHTML = ''; 
    cats.forEach(c => {
        let btn = document.createElement('div');
        btn.className = 'cat-pill'; if(c==='todos') btn.classList.add('active');
        btn.innerText = c.charAt(0).toUpperCase() + c.slice(1);
        btn.onclick = () => filterProducts(c, btn);
        dynamicCategories.appendChild(btn);
    });
}

function renderProducts(list) {
    productsGrid.innerHTML = ''; 
    if(list.length===0) { productsGrid.innerHTML='<p style="padding:20px;grid-column:1/-1;text-align:center">No hay productos.</p>'; return; }

    list.forEach(prod => {
        let final = prod.descuento > 0 ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
        let oldPrice = prod.descuento > 0 ? `<span class="original-price">S/ ${prod.precio.toFixed(2)}</span>` : `<span class="original-price">S/ ${(prod.precio*1.2).toFixed(2)}</span>`;
        let dealTag = prod.descuento > 0 ? `<div class="deal-tag">⚡ OFERTA FLASH -${prod.descuento}%</div>` : '';
        
        let isAgotado = prod.stock <= 0;
        let btnHtml = isAgotado ? `<button class="btn-disabled">AGOTADO</button>` : `<button class="btn-add-cart" onclick="event.stopPropagation(); add('${prod.nombre}')">AÑADIR</button>`;
        let overlay = isAgotado ? `<div class="agotado-overlay"><span class="agotado-text">AGOTADO</span></div>` : '';

        const div = document.createElement('div');
        div.className = 'product-card';
        div.onclick = () => openDetail(prod);

        div.innerHTML = `
            <div class="img-wrapper"><img src="${prod.imagen}" onerror="this.src='https://via.placeholder.com/300'">${dealTag}${overlay}</div>
            <div class="info-wrapper">
                <div class="p-title">${prod.nombre}</div>
                <div class="price-row"><span class="current-price">S/ ${final.toFixed(2)}</span>${oldPrice}</div>
                <div class="meta-row">
                    <span class="stars">★★★★★ ${prod.rating}</span>
                    <span class="sold-count">${prod.sold}+ vendidos</span>
                </div>
                ${btnHtml}
            </div>`;
        productsGrid.appendChild(div);
    });
}

// --- DETALLE ---
function openDetail(p) {
    currentDetailProd = p;
    let final = p.descuento > 0 ? p.precio - (p.precio * p.descuento / 100) : p.precio;
    
    detailImg.src = p.imagen || 'https://via.placeholder.com/300';
    detailTitle.innerText = p.nombre;
    detailPrice.innerText = `S/ ${final.toFixed(2)}`;
    detailDesc.innerText = p.descripcion;
    detailSold.innerText = `(${p.sold} vendidos)`;
    
    let stockBox = detailStock;
    let btn = detailBtn;
    
    if(p.stock <= 0) {
        stockBox.innerText = "Producto Agotado"; stockBox.className = "stock-box out";
        btn.innerText = "AGOTADO"; btn.disabled = true;
    } else {
        stockBox.innerText = `Stock disponible: ${p.stock} unidades`; stockBox.className = "stock-box";
        btn.innerText = "AÑADIR AL CARRITO"; btn.disabled = false;
    }
    productDetailModal.style.display = 'block';
}
function closeDetail() { productDetailModal.style.display = 'none'; }
function addToCartFromDetail() { if(currentDetailProd && currentDetailProd.stock > 0) { add(currentDetailProd.nombre); closeDetail(); } }

// --- CARRITO ---
function add(name) {
    let prod = allProducts.find(p => p.nombre === name);
    if (!prod) return;
    let item = cart.find(i => i.name === name);
    let qty = item ? item.quantity : 0;

    if(qty >= prod.stock) { alert(`¡Ups! Solo quedan ${prod.stock} unidades disponibles.`); return; }

    let price = prod.descuento > 0 ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
    if(item) item.quantity++; else cart.push({ name, price, quantity: 1 });
    
    updateCartUI();
    const fab = document.querySelector('.mobile-fab'); 
    if(fab) { fab.transform='scale(1.2)'; setTimeout(()=>fab.style.transform='scale(1)', 200); }
}

function changeQty(index, change) {
    let item = cart[index];
    let prod = allProducts.find(p => p.nombre === item.name);
    if(change > 0) {
        if(item.quantity >= prod.stock) { alert("No hay más stock."); return; }
        item.quantity++;
    } else {
        item.quantity--;
        if (item.quantity < 1) cart.splice(index, 1);
    }
    updateCartUI();
}

function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); if(cart.length === 0) closeModal(); }

function updateCartUI() {
    let subtotal = 0, count = 0, itemsHtml = '';
    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity; count += item.quantity;
        itemsHtml += `
            <div class="cart-item-row">
                <div class="cart-info">
                    <span class="cart-name">${item.name}</span>
                    <span class="cart-price">S/ ${item.price.toFixed(2)} c/u</span>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    <i class="fas fa-trash-alt btn-trash" onclick="removeFromCart(${index})"></i>
                </div>
            </div>`;
    });

    let discount = 0;
    let barMessage = '', barClass = 'discount-alert', barDisplay = 'block';
    if (cart.length === 0) { barDisplay = 'none'; }
    else if (subtotal >= PROMO_META) { discount = PROMO_BONO; barMessage = `🎉 ¡Genial! Tienes <b>S/ ${PROMO_BONO} OFF</b>`; barClass += ' success'; }
    else { barMessage = `🎁 Agrega <b>S/ ${(PROMO_META - subtotal).toFixed(2)}</b> para descuento.`; }

    let total = subtotal - discount;
    let summaryHtml = `
        <div class="summary-row"><span>Subtotal:</span> <span>S/ ${subtotal.toFixed(2)}</span></div>
        ${discount > 0 ? `<div class="summary-row discount-text"><span>Descuento:</span> <span>- S/ ${discount.toFixed(2)}</span></div>` : ''}
        <div class="summary-total"><span>Total:</span> <span>S/ ${total.toFixed(2)}</span></div>`;

    document.getElementById('desktop-cart-items').innerHTML = itemsHtml || '<p style="text-align:center; color:#999">Tu carrito está vacío</p>';
    document.getElementById('desktop-cart-summary').innerHTML = summaryHtml;
    const deskBar = document.getElementById('desktop-discount-bar');
    deskBar.innerHTML = barMessage; deskBar.className = barClass; deskBar.style.display = barDisplay;

    document.getElementById('mobile-cart-items').innerHTML = itemsHtml;
    document.getElementById('mobile-cart-summary').innerHTML = summaryHtml;
    const mobBar = document.getElementById('mobile-discount-bar');
    mobBar.innerHTML = barMessage; mobBar.className = barClass; mobBar.style.display = barDisplay;
    
    document.getElementById('mobile-count').innerText = count;
}

function filterProducts(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active')); btn.classList.add('active');
    renderProducts(cat === 'todos' ? allProducts : allProducts.filter(p => p.categoria === cat));
}
function searchProducts() { 
    let val = searchInput.value.toLowerCase(); 
    renderProducts(allProducts.filter(p => p.nombre.toLowerCase().includes(val))); 
}
function openModal() { document.getElementById('cart-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('cart-modal').style.display = 'none'; }

function checkout() {
    if (cart.length === 0) return;
    let subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    let discount = subtotal >= PROMO_META ? PROMO_BONO : 0;
    let total = subtotal - discount;
    let msg = "Hola AMELI'S, quiero pedir:%0A";
    cart.forEach(i => msg += `▪ ${i.quantity} x ${i.name} - S/ ${(i.price * i.quantity).toFixed(2)}%0A`);
    msg += `%0A----------------%0ASubtotal: S/ ${subtotal.toFixed(2)}`;
    if(discount > 0) msg += `%0A*Descuento Especial: - S/ ${discount.toFixed(2)}* 🎉`;
    msg += `%0A*TOTAL A PAGAR: S/ ${total.toFixed(2)}*`;
    window.open(`https://wa.me/51904850808?text=${msg}`, '_blank');
}

// --- Admin Specific Logic (integrated from admin.js) ---
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
                rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1),
                sold: Math.floor(Math.random() * 200) + 50
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
}

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
