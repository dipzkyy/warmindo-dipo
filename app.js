import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    push, 
    onValue, 
    update,
    remove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// ==================== CONFIGURATION ====================
const firebaseConfig = {
    apiKey: "AIzaSyC4u5vMXzx8mWS3qEDTGpy2b3-wwXQwsHw",
    authDomain: "warmindo-dipo.firebaseapp.com",
    databaseURL: "https://warmindo-dipo-default-rtdb.firebaseio.com",
    projectId: "warmindo-dipo",
    storageBucket: "warmindo-dipo.firebasestorage.app",
    messagingSenderId: "522323929302",
    appId: "1:522323929302:web:af4960c839c83e335ac177",
    measurementId: "G-VC0E9WHZW3"
};

// ==================== INITIALIZATION ====================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==================== DATA MODELS ====================
const MENU_DATA = [
    // Makanan
    { 
        cat: 'Makanan', 
        name: 'Indomie', 
        price: 7000, 
        icon: '🍜', 
        hasVariant: true,
        color: 'warning' 
    },
    
    // Topping
    { cat: 'Topping', name: 'Sayur', price: 1000, icon: '🥬', color: 'success' },
    { cat: 'Topping', name: 'Sosis', price: 2000, icon: '🌭', color: 'danger' },
    { cat: 'Topping', name: 'Nugget', price: 2000, icon: '🍗', color: 'warning' },
    { cat: 'Topping', name: 'Odeng', price: 2000, icon: '🍥', color: 'info' },
    { cat: 'Topping', name: 'Telur', price: 3000, icon: '🥚', color: 'warning' },
    
    // Camilan
    { cat: 'Camilan', name: 'Cireng Salju', price: 7000, icon: '🍘', color: 'light' },
    { cat: 'Camilan', name: 'Cireng Suwir', price: 10000, icon: '🥟', color: 'success' },
    { cat: 'Camilan', name: 'Jasuke', price: 10000, icon: '🌽', color: 'warning' },
    { cat: 'Camilan', name: 'French Fries', price: 10000, icon: '🍟', color: 'danger' },
    { cat: 'Camilan', name: 'Corndog Sosis', price: 10000, icon: '🌭', color: 'primary' },
    { cat: 'Camilan', name: 'Corndog Mozza', price: 12000, icon: '🧀', color: 'info' },
    { cat: 'Camilan', name: 'Sosis Bakar', price: 12000, icon: '🍢', color: 'danger' },
    { cat: 'Camilan', name: 'Mix Platter', price: 15000, icon: '🍱', color: 'success' },
    
    // Minuman (Kopi - tanpa opsi suhu)
    { 
        cat: 'Minuman', 
        name: 'Kopi Kapal Api', 
        price: 4000, 
        icon: '☕', 
        color: 'dark',
        temp: null
    },
    { 
        cat: 'Minuman', 
        name: 'Kopi Berontoseno', 
        price: 4000, 
        icon: '☕', 
        color: 'dark',
        temp: null
    },
    
    // Minuman dengan opsi panas/dingin
    { 
        cat: 'Minuman', 
        name: 'MaxTea Teh Tarik', 
        price: 5000, 
        icon: '🧋', 
        color: 'info',
        temp: ['Panas', 'Dingin']
    },
    { 
        cat: 'Minuman', 
        name: 'MaxTea Lemon Tea', 
        price: 5000, 
        icon: '🍋', 
        color: 'warning',
        temp: ['Panas', 'Dingin']
    },
    { 
        cat: 'Minuman', 
        name: 'Good Day Cappucino', 
        price: 5000, 
        icon: '🥤', 
        color: 'primary',
        temp: ['Panas', 'Dingin']
    },
    { 
        cat: 'Minuman', 
        name: 'Nutrisari Jeruk Peras', 
        price: 5000, 
        icon: '🍊', 
        color: 'warning',
        temp: ['Panas', 'Dingin']
    },
    { 
        cat: 'Minuman', 
        name: 'Nutrisari Jeruk Nipis', 
        price: 5000, 
        icon: '🍋', 
        color: 'success',
        temp: ['Panas', 'Dingin']
    },
    { 
        cat: 'Minuman', 
        name: 'Nutrisari Jeruk Manis', 
        price: 5000, 
        icon: '🍊', 
        color: 'warning',
        temp: ['Panas', 'Dingin']
    },
    { 
        cat: 'Minuman', 
        name: 'Susu Frisian Flag', 
        price: 5000, 
        icon: '🥛', 
        color: 'light',
        temp: ['Panas', 'Dingin']
    },
    { 
        cat: 'Minuman', 
        name: 'Milo / Hilo', 
        price: 5000, 
        icon: '🍫', 
        color: 'danger',
        temp: ['Panas', 'Dingin']
    },
];

const INDOMIE_VARIANTS = [
    { name: 'Kaldu Ayam', icon: '🍗', color: 'warning' },
    { name: 'Soto Special', icon: '🍜', color: 'success' },
    { name: 'Mie Ayam Geprek', icon: '🌶️', color: 'danger' },
    { name: 'Seblak Hot Jeletot', icon: '🔥', color: 'danger' },
    { name: 'Nyemek Jogja', icon: '🏮', color: 'primary' },
    { name: 'Mie Goreng (Ori)', icon: '🍝', color: 'warning' },
    { name: 'Mie Rendang', icon: '🥘', color: 'dark' }
];

// ==================== GLOBAL STATE ====================
let cart = [];
let userRole = '';
let pendingOrders = 0;
let selectedTransaksiDate = new Date().toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];
let currentModalItem = null;
let selectedTemperature = null;

// Role names mapping
const ROLE_NAMES = {
    kasir: 'Kasir',
    admin: 'Admin', 
    owner: 'Owner'
};

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
    initDateInputs();
    initClock();
    setupEventListeners();
    initCategories();
    
    // Auto-focus PIN input
    const pinInput = document.getElementById('login-pin');
    if (pinInput) pinInput.focus();
});

// ==================== INITIALIZATION FUNCTIONS ====================
function initDateInputs() {
    const transaksiInput = document.getElementById('tgl-transaksi');
    const laporanInput = document.getElementById('tgl-laporan');
    
    if (transaksiInput) {
        transaksiInput.value = selectedTransaksiDate;
        transaksiInput.addEventListener('change', function() {
            selectedTransaksiDate = this.value;
            updateDateDisplay();
        });
    }
    
    if (laporanInput) laporanInput.value = today;
    updateDateDisplay();
}

function updateDateDisplay() {
    const dateEl = document.getElementById('selected-date-display');
    if (!dateEl) return;
    
    const dateObj = new Date(selectedTransaksiDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = dateObj.toLocaleDateString('id-ID', options);
    
    // Tambahkan indikator jika bukan hari ini
    const todayBadge = document.getElementById('today-badge');
    if (todayBadge) {
        if (selectedTransaksiDate === today) {
            todayBadge.textContent = 'HARI INI';
            todayBadge.className = 'badge bg-success';
        } else {
            todayBadge.textContent = 'TANGGAL LAIN';
            todayBadge.className = 'badge bg-warning text-dark';
        }
    }
}

function initClock() {
    function updateClock() {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        
        if (dateEl && timeEl) {
            dateEl.textContent = now.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
            });
            timeEl.textContent = now.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

function initCategories() {
    const categories = [...new Set(MENU_DATA.map(item => item.cat))];
    const container = document.getElementById('category-tabs');
    if (!container) return;
    
    container.innerHTML = categories.map((cat, index) => `
        <button class="category-tab ${index === 0 ? 'active' : ''}" 
                onclick="filterByCategory('${cat}')"
                data-category="${cat}">
            ${cat}
        </button>
    `).join('');
}

function setupEventListeners() {
    // Enter key untuk login
    const pinInput = document.getElementById('login-pin');
    if (pinInput) {
        pinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.login();
        });
    }
    
    // Enter key untuk customer name
    const custNameInput = document.getElementById('cust-name');
    if (custNameInput) {
        custNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.processOrder();
        });
    }
    
    // Quick date buttons
    document.querySelectorAll('.quick-date-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const days = parseInt(this.dataset.days);
            const date = new Date();
            date.setDate(date.getDate() + days);
            selectedTransaksiDate = date.toISOString().split('T')[0];
            document.getElementById('tgl-transaksi').value = selectedTransaksiDate;
            updateDateDisplay();
        });
    });
    
    // Temperature selection
    document.querySelectorAll('.temp-option').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedTemperature = this.dataset.temp;
            document.querySelectorAll('.temp-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ==================== AUTHENTICATION ====================
window.login = () => {
    const pinInput = document.getElementById('login-pin');
    if (!pinInput) return;
    
    const pin = pinInput.value.trim();
    
    switch(pin) {
        case '1234':
            setRole('kasir');
            break;
        case '1337':
            setRole('admin');
            break;
        case '9999':
            setRole('owner');
            break;
        default:
            showToast('error', 'PIN Salah', 'Periksa kembali PIN Anda');
            pinInput.value = '';
            pinInput.focus();
            break;
    }
};

function setRole(role) {
    userRole = role;
    
    // Hide login, show app
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    if (loginScreen) loginScreen.classList.add('d-none');
    if (appContainer) appContainer.classList.remove('d-none');
    
    // Update role display
    const roleDisplay = document.getElementById('role-display');
    if (roleDisplay) {
        roleDisplay.textContent = ROLE_NAMES[role];
        roleDisplay.className = `badge bg-${role === 'owner' ? 'danger' : role === 'admin' ? 'warning' : 'success'}`;
    }
    
    // Initialize based on role
    renderMenu();
    listenKitchen();
    
    // Show admin tab for admin/owner
    if (role === 'admin' || role === 'owner') {
        const adminTab = document.getElementById('nav-admin');
        if (adminTab) adminTab.classList.remove('d-none');
        loadReport();
    }
    
    // Switch to kasir tab by default
    switchTab('kasir');
    showToast('success', `Selamat datang, ${ROLE_NAMES[role]}!`, 'Aplikasi siap digunakan');
};

window.logout = () => {
    if (cart.length > 0) {
        Swal.fire({
            title: 'Keluar Aplikasi?',
            text: 'Pesanan di keranjang akan hilang',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            backdrop: true
        }).then((result) => {
            if (result.isConfirmed) {
                location.reload();
            }
        });
    } else {
        location.reload();
    }
};

// ==================== MENU SYSTEM ====================
function renderMenu(category = null) {
    const container = document.getElementById('menu-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    let itemsToRender = category ? 
        MENU_DATA.filter(item => item.cat === category) : 
        MENU_DATA;
    
    if (itemsToRender.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="text-muted">Tidak ada item untuk kategori ini</p>
            </div>
        `;
        return;
    }
    
    itemsToRender.forEach(item => {
        const hasOptions = item.hasVariant || (item.temp && item.temp.length > 0);
        const optionsText = hasOptions ? 
            (item.hasVariant ? '<span class="menu-badge">7 varian</span>' : 
             '<span class="menu-badge">Panas/Dingin</span>') : '';
        
        container.innerHTML += `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="menu-card card border-0 shadow-sm h-100" 
                 onclick="handleMenuClick(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <div class="card-body text-center p-3">
                    <div class="menu-icon bg-${item.color} bg-opacity-10 text-${item.color} rounded-circle mb-3 mx-auto">
                        ${item.icon}
                    </div>
                    <h6 class="menu-name fw-bold mb-2">${item.name}</h6>
                    ${optionsText}
                    <div class="menu-price fw-bold text-primary mt-2">
                        Rp ${item.price.toLocaleString('id-ID')}
                    </div>
                    <button class="btn btn-primary btn-sm mt-3 add-btn">
                        <i class="fas fa-plus me-1"></i>Tambah
                    </button>
                </div>
            </div>
        </div>
        `;
    });
}

window.handleMenuClick = (item) => {
    currentModalItem = item;
    
    if (item.hasVariant) {
        showIndomieModal();
    } else if (item.temp && item.temp.length > 0) {
        showTemperatureModal(item);
    } else {
        addToCart(item.name, item.price, item.icon);
    }
};

function showIndomieModal() {
    const modal = new bootstrap.Modal(document.getElementById('indomieModal'));
    const container = document.getElementById('indomie-variants');
    
    container.innerHTML = INDOMIE_VARIANTS.map(variant => `
        <div class="col-6 col-md-4">
            <button class="btn btn-outline-${variant.color} w-100 h-100 p-3 variant-btn" 
                    onclick="addIndomieVariant('${variant.name}', '${variant.icon}')">
                <div class="fs-2 mb-2">${variant.icon}</div>
                <div class="fw-bold">${variant.name}</div>
                <small class="text-muted">Rp 7,000</small>
            </button>
        </div>
    `).join('');
    
    modal.show();
}

function showTemperatureModal(item) {
    const modal = new bootstrap.Modal(document.getElementById('temperatureModal'));
    const title = document.getElementById('temperatureModalTitle');
    const container = document.getElementById('temperature-options');
    
    title.textContent = item.name;
    selectedTemperature = null;
    
    container.innerHTML = item.temp.map(temp => `
        <div class="col-6">
            <button class="btn btn-outline-primary w-100 h-100 p-4 temp-option" 
                    data-temp="${temp}"
                    onclick="selectTemperature('${temp}')">
                <div class="fs-2 mb-2">${item.icon}</div>
                <div class="fw-bold">${temp}</div>
                <small class="text-muted">Rp ${item.price.toLocaleString('id-ID')}</small>
            </button>
        </div>
    `).join('');
    
    // Reset temperature buttons
    setTimeout(() => {
        document.querySelectorAll('.temp-option').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.temp-option').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedTemperature = this.dataset.temp;
            });
        });
    }, 100);
    
    modal.show();
}

window.selectTemperature = (temp) => {
    selectedTemperature = temp;
};

window.addIndomieVariant = (variantName, icon) => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('indomieModal'));
    if (modal) modal.hide();
    
    addToCart(`Indomie ${variantName}`, 7000, icon);
};

window.confirmTemperature = () => {
    if (!currentModalItem || !selectedTemperature) {
        showToast('warning', 'Pilih Suhu', 'Silakan pilih suhu terlebih dahulu');
        return;
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('temperatureModal'));
    if (modal) modal.hide();
    
    addToCart(`${currentModalItem.name} (${selectedTemperature})`, currentModalItem.price, currentModalItem.icon);
    selectedTemperature = null;
    currentModalItem = null;
};

window.filterByCategory = (category) => {
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    // Render menu for category
    renderMenu(category);
    
    // Scroll to menu
    document.getElementById('menu-container').scrollIntoView({ behavior: 'smooth' });
};

window.addToCart = (name, price, icon = '📝') => {
    // Check if item already exists
    const existingIndex = cart.findIndex(item => item.name === name);
    
    if (existingIndex > -1) {
        // Update quantity
        cart[existingIndex].quantity += 1;
        cart[existingIndex].total = cart[existingIndex].quantity * price;
    } else {
        // Add new item
        cart.push({
            name,
            price,
            icon,
            quantity: 1,
            total: price,
            timestamp: Date.now()
        });
    }
    
    updateCartUI();
    animateAddToCart();
    showToast('success', 'Ditambahkan', `${name} ke keranjang`);
};

function animateAddToCart() {
    const cartIcon = document.querySelector('.cart-icon i');
    cartIcon.classList.add('animate__animated', 'animate__tada');
    setTimeout(() => {
        cartIcon.classList.remove('animate__animated', 'animate__tada');
    }, 1000);
}

window.removeFromCart = (index) => {
    if (index < 0 || index >= cart.length) return;
    
    Swal.fire({
        title: 'Hapus Item?',
        text: `Apakah yakin menghapus ${cart[index].name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                cart[index].total = cart[index].quantity * cart[index].price;
            } else {
                cart.splice(index, 1);
            }
            updateCartUI();
            showToast('success', 'Dihapus', 'Item telah dihapus dari keranjang');
        }
    });
};

window.resetCart = () => {
    if (cart.length === 0) return;
    
    Swal.fire({
        title: 'Kosongkan Keranjang?',
        text: 'Semua item akan dihapus',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Kosongkan',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
            cart = [];
            const custNameInput = document.getElementById('cust-name');
            if (custNameInput) custNameInput.value = '';
            updateCartUI();
            showToast('success', 'Dikosongkan', 'Keranjang telah dikosongkan');
        }
    });
};

function updateCartUI() {
    const cartPanel = document.getElementById('cart-panel');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartDateDisplay = document.getElementById('cart-date-display');
    const cartFinalTotal = document.getElementById('cart-final-total');
    
    if (!cartPanel || !cartCount || !cartTotal || !cartItemsList) return;
    
    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);
    
    // Update UI
    cartCount.textContent = totalItems;
    cartTotal.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    
    if (cartSubtotal) {
        cartSubtotal.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    }
    
    if (cartFinalTotal) {
        cartFinalTotal.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    }
    
    if (cartDateDisplay) {
        const dateObj = new Date(selectedTransaksiDate);
        cartDateDisplay.textContent = dateObj.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    // Show/hide cart panel
    if (totalItems > 0) {
        cartPanel.classList.remove('d-none');
        
        // Render cart items
        cartItemsList.innerHTML = cart.map((item, index) => `
            <div class="cart-item d-flex justify-content-between align-items-center p-3 bg-white rounded-3 mb-2 shadow-sm">
                <div class="d-flex align-items-center">
                    <div class="cart-item-icon fs-4 me-3">${item.icon}</div>
                    <div>
                        <div class="cart-item-name fw-bold">${item.name}</div>
                        <small class="text-muted">Rp ${item.price.toLocaleString('id-ID')} × ${item.quantity}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="cart-item-price fw-bold text-primary">
                        Rp ${item.total.toLocaleString('id-ID')}
                    </span>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="btn btn-outline-secondary px-3" disabled>
                            ${item.quantity}
                        </button>
                        <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="removeFromCart(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        cartPanel.classList.add('d-none');
    }
}

window.updateQuantity = (index, change) => {
    if (index < 0 || index >= cart.length) return;
    
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        cart[index].total = newQuantity * cart[index].price;
        updateCartUI();
    }
};

window.toggleCartDetail = () => {
    const details = document.getElementById('cart-details');
    const arrow = document.getElementById('cart-arrow');
    const cartPanel = document.getElementById('cart-panel');
    
    if (details && arrow) {
        details.classList.toggle('d-none');
        arrow.classList.toggle('fa-chevron-up');
        arrow.classList.toggle('fa-chevron-down');
        
        // Adjust cart panel height
        if (cartPanel) {
            cartPanel.style.maxHeight = details.classList.contains('d-none') ? '80px' : '400px';
        }
    }
};

window.searchMenu = () => {
    const searchInput = document.getElementById('search-menu');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.menu-card').forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const parent = card.closest('.col-6, .col-md-4, .col-lg-3');
        
        if (parent) {
            if (query === '' || cardText.includes(query)) {
                parent.style.display = 'block';
                card.classList.add('animate__animated', 'animate__fadeIn');
            } else {
                parent.style.display = 'none';
            }
        }
    });
};

// ==================== ORDER PROCESSING ====================
window.processOrder = async () => {
    // Validation
    const customerNameInput = document.getElementById('cust-name');
    const paymentMethodSelect = document.getElementById('payment-method');
    
    if (!customerNameInput || !paymentMethodSelect) return;
    
    const customerName = customerNameInput.value.trim();
    const paymentMethod = paymentMethodSelect.value;
    const selectedDate = selectedTransaksiDate;
    
    // Basic validation
    if (cart.length === 0) {
        showToast('warning', 'Keranjang Kosong', 'Tambahkan item terlebih dahulu');
        return;
    }
    
    if (!customerName) {
        showToast('warning', 'Nama Pelanggan', 'Harap isi nama pelanggan');
        customerNameInput.focus();
        return;
    }
    
    // Calculate totals
    const itemsSummary = cart.map(item => 
        `${item.name} (${item.quantity}×)`
    ).join(', ');
    
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    
    // Prepare order data
    const orderData = {
        customer: customerName,
        payment: paymentMethod,
        items: JSON.parse(JSON.stringify(cart)),
        summary: itemsSummary,
        total: total,
        timestamp: Date.now(),
        date: selectedDate,
        time: new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        }),
        status: selectedDate === today ? 'pending' : 'done',
        processedBy: userRole,
        orderDate: new Date().toLocaleDateString('id-ID')
    };
    
    try {
        // Show loading
        const loadingSwal = Swal.fire({
            title: 'Memproses Pesanan...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Save to Firebase
        const orderRef = await push(ref(db, `orders/${selectedDate}`), orderData);
        const orderId = orderRef.key;
        
        // ================== KONEKSI KE SPREADSHEET (BARU) ==================
        
        // 1. URL Script Baru Anda (Yang ada Auto-Header)
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycaBWxwU8x9j6BZxYD-glCn-MGUbsAgifYdba8c-7TLTv58bdVCpFkwohrvN_mfa5z/exec";

        // 2. Siapkan data yang rapi
        const dataForSheet = {
            date: orderData.date,      // Tanggal
            time: orderData.time,      // Jam
            customer: orderData.customer, // Nama Pelanggan
            summary: orderData.summary,   // Pesanan
            total: orderData.total,       // Total Harga
            payment: orderData.payment,   // Pembayaran
            cashier: userRole             // Kasir/Admin
        };

        // 3. Tembak ke Google Sheet
        // Menggunakan mode 'no-cors' agar browser tidak memblokir
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataForSheet)
        })
        .then(() => console.log("✅ Data dikirim ke Spreadsheet"))
        .catch(err => console.error("❌ Gagal kirim ke Spreadsheet:", err));

        // ================== AKHIR KODE SPREADSHEET ==================
        
        // Close loading
        await loadingSwal.close();
        
        // Success notification
        const result = await Swal.fire({
            icon: 'success',
            title: 'Pesanan Berhasil!',
            html: `
                <div class="text-start">
                    <p><strong>Pelanggan:</strong> ${customerName}</p>
                    <p><strong>Tanggal:</strong> ${new Date(selectedDate).toLocaleDateString('id-ID')}</p>
                    <p><strong>Total:</strong> Rp ${total.toLocaleString('id-ID')}</p>
                    <p><strong>ID Pesanan:</strong> ${orderId ? orderId.slice(-6) : 'N/A'}</p>
                    <p><strong>Status:</strong> ${selectedDate === today ? 'Menunggu di dapur' : 'Arsip (tanggal lalu)'}</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fab fa-whatsapp me-2"></i>Kirim Nota',
            cancelButtonText: 'Tutup',
            showCloseButton: true,
            reverseButtons: true,
            backdrop: true
        });
        
        if (result.isConfirmed) {
            sendWhatsAppNotification(customerName, itemsSummary, total, paymentMethod, selectedDate);
        }
        
        // Reset and continue
        cart = [];
        customerNameInput.value = '';
        updateCartUI();
        
        // Switch to kitchen view if today's order
        if (selectedDate === today) {
            switchTab('dapur');
        }
        
    } catch (error) {
        console.error('Order Error:', error);
        showToast('error', 'Gagal Memproses', 'Terjadi kesalahan saat menyimpan pesanan');
    }
};

function sendWhatsAppNotification(customer, items, total, payment, date) {
    const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const message = `*WARMINDO DIPO*%0A%0A`
        + `Halo *${customer}*,%0A`
        + `Pesanan Anda:%0A%0A`
        + `${items}%0A%0A`
        + `*Total: Rp ${total.toLocaleString('id-ID')}*%0A`
        + `Metode: ${payment}%0A`
        + `Tanggal: ${formattedDate}%0A%0A`
        + `Terima kasih atas pesanannya! 🙏%0A`
        + `_Pesanan otomatis dikirim via sistem_`;
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

// ==================== KITCHEN SYSTEM ====================
function listenKitchen() {
    const countBadge = document.getElementById('kitchen-count');
    const pendingBadge = document.getElementById('pending-count');
    const container = document.getElementById('kitchen-container');
    
    if (!countBadge || !pendingBadge || !container) return;
    
    onValue(ref(db, `orders/${today}`), (snapshot) => {
        container.innerHTML = '';
        const data = snapshot.val();
        let pendingCount = 0;
        
        if (!data) {
            container.innerHTML = `
                <div class="empty-state text-center py-5">
                    <i class="fas fa-check-circle fa-3x text-success mb-3 opacity-50"></i>
                    <p class="text-muted">Tidak ada pesanan hari ini</p>
                </div>
            `;
            countBadge.textContent = '0';
            if (pendingBadge) pendingBadge.textContent = '0 menunggu';
            pendingOrders = 0;
            return;
        }
        
        // Process orders
        Object.entries(data).forEach(([key, order]) => {
            if (order.status === 'pending') {
                pendingCount++;
                
                const orderHtml = `
                <div class="kitchen-card card border-0 shadow-sm mb-3 animate__animated animate__fadeIn">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="fw-bold mb-1">${order.customer}</h5>
                                <small class="text-muted">ID: ${key.slice(-6)}</small>
                            </div>
                            <span class="badge bg-warning">${order.time}</span>
                        </div>
                        
                        <div class="mb-3">
                            ${Array.isArray(order.items) ? order.items.map(item => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="d-flex align-items-center">
                                        <span class="me-2">${item.icon || '🍽️'}</span>
                                        <span>${item.name}</span>
                                    </div>
                                    <span class="badge bg-light text-dark">×${item.quantity || 1}</span>
                                </div>
                            `).join('') : ''}
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                            <div>
                                <span class="badge bg-light text-dark">
                                    <i class="fas fa-wallet me-1"></i>${order.payment || 'Tunai'}
                                </span>
                                <span class="badge bg-light text-dark ms-2">
                                    <i class="fas fa-money-bill me-1"></i>Rp ${order.total.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div>
                                <button onclick="cancelOrder('${key}', '${order.customer}')" 
                                        class="btn btn-outline-danger btn-sm me-2">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button onclick="finishOrder('${key}', '${order.customer}')" 
                                        class="btn btn-success btn-sm">
                                    <i class="fas fa-check me-1"></i>Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                
                container.innerHTML += orderHtml;
            }
        });
        
        // Update counters
        countBadge.textContent = pendingCount;
        if (pendingBadge) pendingBadge.textContent = `${pendingCount} menunggu`;
        
        // Play sound if new order
        if (pendingCount > pendingOrders) {
            playNotificationSound();
            showToast('info', 'Pesanan Baru!', 'Ada pesanan baru masuk ke dapur');
        }
        pendingOrders = pendingCount;
        
        // Show empty state if no pending orders
        if (pendingCount === 0) {
            container.innerHTML = `
                <div class="empty-state text-center py-5">
                    <i class="fas fa-check-circle fa-3x text-success mb-3 opacity-50"></i>
                    <p class="text-muted">Semua pesanan selesai</p>
                </div>
            `;
        }
    });
}

function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.log('Audio not supported');
    }
}

window.finishOrder = (orderId, customerName) => {
    Swal.fire({
        title: 'Selesaikan Pesanan?',
        html: `Pesanan <strong>${customerName}</strong> siap disajikan?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Selesai',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
            update(ref(db, `orders/${today}/${orderId}`), { 
                status: 'done',
                finishedAt: new Date().toLocaleTimeString('id-ID'),
                finishedBy: userRole
            }).then(() => {
                showToast('success', 'Pesanan Selesai', `Pesanan ${customerName} sudah siap`);
            });
        }
    });
};

window.cancelOrder = (orderId, customerName) => {
    Swal.fire({
        title: 'Batalkan Pesanan?',
        html: `Pesanan <strong>${customerName}</strong> akan dibatalkan?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Kembali',
        confirmButtonColor: '#dc3545',
        reverseButtons: true,
        backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
            remove(ref(db, `orders/${today}/${orderId}`)).then(() => {
                showToast('success', 'Pesanan Dibatalkan', `Pesanan ${customerName} telah dibatalkan`);
            });
        }
    });
};

// ==================== REPORT SYSTEM ====================
window.loadReport = () => {
    const tbody = document.getElementById('report-body');
    const omzetEl = document.getElementById('report-omzet');
    const countEl = document.getElementById('report-count');
    const avgEl = document.getElementById('report-avg');
    
    if (!tbody || !omzetEl || !countEl) return;
    
    const dateInput = document.getElementById('tgl-laporan');
    if (!dateInput) return;
    
    const date = dateInput.value;
    
    // Show loading
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span class="ms-2">Memuat data...</span>
            </td>
        </tr>
    `;
    
    onValue(ref(db, `orders/${date}`), (snapshot) => {
        tbody.innerHTML = '';
        let totalOmzet = 0;
        let transactionCount = 0;
        const data = snapshot.val();
        
        if (!data) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4 text-muted">
                        <i class="fas fa-inbox fa-2x mb-3 opacity-25"></i>
                        <p>Tidak ada transaksi pada tanggal ini</p>
                    </td>
                </tr>
            `;
            omzetEl.textContent = 'Rp 0';
            if (countEl) countEl.textContent = '0 transaksi';
            if (avgEl) avgEl.textContent = 'Rp 0';
            return;
        }
        
        // Convert to array and sort by timestamp
        const ordersArray = Object.entries(data)
            .map(([id, order]) => ({ id, ...order }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // Render table rows
        ordersArray.forEach(order => {
            transactionCount++;
            totalOmzet += order.total || 0;
            
            const statusBadge = order.status === 'pending' 
                ? '<span class="badge bg-warning"><i class="fas fa-clock me-1"></i>Pending</span>'
                : '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Selesai</span>';
            
            tbody.innerHTML += `
                <tr class="animate__animated animate__fadeIn">
                    <td class="small">
                        <div class="fw-bold">${order.time || '-'}</div>
                        <div>${statusBadge}</div>
                    </td>
                    <td>
                        <div class="fw-bold">${order.customer || '-'}</div>
                        <small class="text-muted d-block">
                            ${order.summary || '-'}
                        </small>
                    </td>
                    <td class="small">
                        <span class="badge bg-light text-dark">
                            ${getPaymentIcon(order.payment)} ${order.payment || 'Tunai'}
                        </span>
                    </td>
                    <td class="text-end fw-bold text-primary">
                        Rp ${(order.total || 0).toLocaleString('id-ID')}
                    </td>
                </tr>
            `;
        });
        
        // Update summary
        const average = transactionCount > 0 ? totalOmzet / transactionCount : 0;
        omzetEl.textContent = `Rp ${totalOmzet.toLocaleString('id-ID')}`;
        if (countEl) countEl.textContent = `${transactionCount} transaksi`;
        if (avgEl) avgEl.textContent = `Rp ${Math.round(average).toLocaleString('id-ID')}`;
    });
};

function getPaymentIcon(paymentMethod) {
    switch(paymentMethod) {
        case 'QRIS': return '📱';
        case 'Transfer': return '🏦';
        case 'Kasbon': return '📒';
        default: return '💵';
    }
}

window.exportPDF = () => {
    if (!window.jspdf) {
        showToast('error', 'PDF Error', 'PDF library tidak tersedia');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const dateInput = document.getElementById('tgl-laporan');
        if (!dateInput) return;
        
        const date = dateInput.value;
        const formattedDate = new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Header with logo
        doc.setFillColor(45, 106, 79);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('WARMINDO DIPO', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Laporan Penjualan', 105, 25, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(formattedDate, 105, 35, { align: 'center' });
        
        // Line separator
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 42, 190, 42);
        
        // AutoTable
        doc.autoTable({
            html: '#report-table',
            startY: 50,
            theme: 'grid',
            headStyles: { 
                fillColor: [45, 106, 79],
                textColor: 255,
                fontSize: 10
            },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 80 },
                2: { cellWidth: 35 },
                3: { cellWidth: 30 }
            }
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(
                `Halaman ${i} dari ${pageCount} • Dicetak: ${new Date().toLocaleString('id-ID')}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
        
        // Save
        doc.save(`Laporan_Warmindo_${date.replace(/-/g, '')}.pdf`);
        
        showToast('success', 'PDF Berhasil', 'Laporan telah diexport');
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        showToast('error', 'Export Gagal', 'Terjadi kesalahan saat membuat PDF');
    }
};

// ==================== TAB NAVIGATION ====================
window.switchTab = (tabName) => {
    // Validate tabName
    const validTabs = ['kasir', 'dapur', 'admin'];
    if (!validTabs.includes(tabName)) {
        console.warn(`Tab "${tabName}" tidak valid`);
        return;
    }
    
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab) tab.classList.remove('active');
    });
    
    const tabButton = document.getElementById(`tab-${tabName}`);
    if (tabButton) tabButton.classList.add('active');
    
    // Update views
    document.querySelectorAll('[id^="view-"]').forEach(view => {
        if (view) view.classList.add('d-none');
    });
    
    const tabView = document.getElementById(`view-${tabName}`);
    if (tabView) tabView.classList.remove('d-none');
    
    // Special actions per tab
    switch (tabName) {
        case 'dapur':
            listenKitchen();
            break;
        case 'admin':
            loadReport();
            break;
        case 'kasir':
            renderMenu();
            break;
    }
};

// ==================== UTILITY FUNCTIONS ====================
function showToast(icon, title, text) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
    
    Toast.fire({
        icon: icon,
        title: title,
        text: text
    });
}

window.showHelp = () => {
    Swal.fire({
        title: 'Keyboard Shortcuts',
        html: `
            <div class="text-start">
                <p><kbd>Ctrl+1</kbd> - Tab Kasir</p>
                <p><kbd>Ctrl+2</kbd> - Tab Dapur</p>
                <p><kbd>Ctrl+3</kbd> - Tab Laporan</p>
                <p><kbd>Esc</kbd> - Tutup Modal</p>
                <p><kbd>F1</kbd> - Bantuan ini</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Mengerti',
        backdrop: true
    });
};

// ==================== SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Skip if focused on input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    
    // Ctrl/Cmd + Number for tabs
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const tabs = ['kasir', 'dapur', 'admin'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
            switchTab(tabs[tabIndex]);
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        const indomieModal = document.getElementById('indomieModal');
        if (indomieModal) {
            const modal = bootstrap.Modal.getInstance(indomieModal);
            if (modal) modal.hide();
        }
        
        const tempModal = document.getElementById('temperatureModal');
        if (tempModal) {
            const modal = bootstrap.Modal.getInstance(tempModal);
            if (modal) modal.hide();
        }
    }
    
    // F1 for help
    if (e.key === 'F1') {
        e.preventDefault();
        showHelp();
    }
});

// ==================== NETWORK DETECTION ====================
window.addEventListener('online', () => {
    showToast('success', 'Koneksi Pulih', 'Aplikasi kembali online');
});

window.addEventListener('offline', () => {
    showToast('warning', 'Koneksi Terputus', 'Bekerja dalam mode offline');
});

// ==================== ERROR HANDLING ====================
window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    
    // Don't show error if it's a known Firebase issue
    if (event.message && event.message.includes('firebase')) return;
    
    // Show user-friendly error
    Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Silakan refresh halaman atau coba lagi nanti',
        showConfirmButton: true,
        confirmButtonText: 'Refresh',
        allowOutsideClick: false,
        backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
});

// ==================== ANIMATIONS ====================
function animateElement(elementId, animation) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('animate__animated', `animate__${animation}`);
        setTimeout(() => {
            element.classList.remove('animate__animated', `animate__${animation}`);
        }, 1000);
    }
}

// Initialize on load
window.onload = () => {
    console.log('Warmindo Dipo PRO v4.0 loaded');
};
