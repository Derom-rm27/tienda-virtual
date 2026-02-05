// Supabase Configuration
const SUPABASE_URL = 'https://gsyncqjiktclkzytjrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeW5jcWppa3RjbGt6eXRqcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTkyMzEsImV4cCI6MjA4NTgzNTIzMX0.1t8xr5SKTPvMH9dOZCrQBxMkMPLqxcturwdwjetnJXU';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let PROMO_META = 99999;
let PROMO_BONO = 0;
let allProducts = [], cart = [];
let currentDetailProd = null;

setInterval(() => {
    const d = new Date();
    document.getElementById('countdown').innerHTML = `Termina en: <span>${23-d.getHours()}</span>:<span>${59-d.getMinutes()}</span>:<span>${59-d.getSeconds()}</span>`;
}, 1000);

async function loadStoreData() {
    try {
        // Fetch products from Supabase
        const { data: productsData, error: productsError } = await supabase
            .from('productos')
            .select('*');

        if (productsError) {
            console.error('Error fetching products:', productsError);
            return;
        }

        // Fetch config from Supabase
        const { data: configData, error: configError } = await supabase
            .from('config')
            .select('dato, valor');

        if (configError) {
            console.warn('Error fetching config:', configError);
            // Continue with default promo values if config fetching fails
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
            rating: parseFloat(item.rating) || (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1), // Use DB value, fallback to random
            sold: parseInt(item.sold) || Math.floor(Math.random() * 200) + 50 // Use DB value, fallback to random
        }));
        
        generateCategories();
        renderProducts(allProducts);
    } catch (e) {
        console.error('Unhandled error in loadStoreData:', e);
    }
}

function generateCategories() {
    const cats = ['todos', ...new Set(allProducts.map(p => p.categoria))];
    const div = document.getElementById('dynamicCategories');
    div.innerHTML = ''; 
    cats.forEach(c => {
        let btn = document.createElement('div');
        btn.className = 'cat-pill'; if(c==='todos') btn.classList.add('active');
        btn.innerText = c.charAt(0).toUpperCase() + c.slice(1);
        btn.onclick = () => filterProducts(c, btn);
        div.appendChild(btn);
    });
}

function renderProducts(list) {
    const grid = document.getElementById('productsGrid'); grid.innerHTML = ''; 
    if(list.length===0) { grid.innerHTML='<p style="padding:20px;grid-column:1/-1;text-align:center">No hay productos.</p>'; return; }

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
        grid.appendChild(div);
    });
}

// --- DETALLE ---
function openDetail(p) {
    currentDetailProd = p;
    let final = p.descuento > 0 ? p.precio - (p.precio * p.descuento / 100) : p.precio;
    
    document.getElementById('detailImg').src = p.imagen || 'https://via.placeholder.com/300';
    document.getElementById('detailTitle').innerText = p.nombre;
    document.getElementById('detailPrice').innerText = `S/ ${final.toFixed(2)}`;
    document.getElementById('detailDesc').innerText = p.descripcion;
    document.getElementById('detailSold').innerText = `(${p.sold} vendidos)`;
    
    let stockBox = document.getElementById('detailStock');
    let btn = document.getElementById('detailBtn');
    
    if(p.stock <= 0) {
        stockBox.innerText = "Producto Agotado"; stockBox.className = "stock-box out";
        btn.innerText = "AGOTADO"; btn.disabled = true;
    } else {
        stockBox.innerText = `Stock disponible: ${p.stock} unidades`; stockBox.className = "stock-box";
        btn.innerText = "AÑADIR AL CARRITO"; btn.disabled = false;
    }
    document.getElementById('productDetailModal').style.display = 'block';
}
function closeDetail() { document.getElementById('productDetailModal').style.display = 'none'; }
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
    if(fab) { fab.style.transform='scale(1.2)'; setTimeout(()=>fab.style.transform='scale(1)', 200); }
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
    let val = document.getElementById('searchInput').value.toLowerCase(); 
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

loadStoreData();