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
    { cat: 'Makanan', name: 'Indomie', price: 7000, icon: '🍜', hasVariant: true },
    
    // Topping
    { cat: 'Topping', name: 'Sayur', price: 1000, icon: '🥬' },
    { cat: 'Topping', name: 'Sosis', price: 2000, icon: '🌭' },
    { cat: 'Topping', name: 'Nugget', price: 2000, icon: '🍗' },
    { cat: 'Topping', name: 'Odeng', price: 2000, icon: '🍥' },
    { cat: 'Topping', name: 'Telur', price: 3000, icon: '🥚' },
    
    // Camilan
    { cat: 'Camilan', name: 'Cireng Salju', price: 7000, icon: '🍘' },
    { cat: 'Camilan', name: 'Cireng Suwir', price: 10000, icon: '🥟' },
    { cat: 'Camilan', name: 'Jasuke', price: 10000, icon: '🌽' },
    { cat: 'Camilan', name: 'French Fries', price: 10000, icon: '🍟' },
    { cat: 'Camilan', name: 'Corndog Sosis', price: 10000, icon: '🌭' },
    { cat: 'Camilan', name: 'Corndog Mozza', price: 12000, icon: '🧀' },
    { cat: 'Camilan', name: 'Sosis Bakar', price: 12000, icon: '🍢' },
    { cat: 'Camilan', name: 'Mix Platter', price: 15000, icon: '🍱' },
    
    // Minuman
    { cat: 'Minuman', name: 'Kopi Kapal Api', price: 4000, icon: '☕' },
    { cat: 'Minuman', name: 'Kopi Berontoseno', price: 4000, icon: '☕' },
    { cat: 'Minuman', name: 'MaxTea Teh Tarik', price: 5000, icon: '🧋' },
    { cat: 'Minuman', name: 'MaxTea Lemon Tea', price: 5000, icon: '🍋' },
    { cat: 'Minuman', name: 'Good Day Cappucino', price: 5000, icon: '🥤' },
    { cat: 'Minuman', name: 'NutriSari Jeruk', price: 5000, icon: '🍊' },
    { cat: 'Minuman', name: 'Susu Frisian Flag', price: 5000, icon: '🥛' },
    { cat: 'Minuman', name: 'Milo / Hilo', price: 5000, icon: '🍫' },
    { cat: 'Minuman', name: 'Es Batu / Extra', price: 1000, icon: '🧊' },
];

const INDOMIE_VARIANTS = [
    { name: 'Kaldu Ayam', icon: '🍗' },
    { name: 'Soto Special', icon: '🍜' },
    { name: 'Mie Ayam Geprek', icon: '🌶️' },
    { name: 'Seblak Hot Jeletot', icon: '🔥' },
    { name: 'Nyemek Jogja', icon: '🏮' },
    { name: 'Mie Goreng (Ori)', icon: '🍝' },
    { name: 'Mie Rendang', icon: '🥘' }
];

// ==================== GLOBAL STATE ====================
let cart = [];
let userRole = '';
let pendingOrders = 0;
let selectedTransaksiDate = new Date().toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
    initDateInputs();
    initClock();
    renderIndomieVariants();
    setupEventListeners();
    
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

function renderIndomieVariants() {
    const container = document.getElementById('indomie-variants');
    if (!container) return;
    
    container.innerHTML = INDOMIE_VARIANTS.map(variant => `
        <div class="col-6 col-md-4">
            <button class="btn btn-outline-primary w-100 py-3 variant-btn" 
                    onclick="addIndomieVariant('${variant.name}')">
                <div class="fs-3 mb-2">${variant.icon}</div>
                <div class="small fw-bold">${variant.name}</div>
                <div class="small text-muted">Rp 7,000</div>
            </button>
        </div>
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
    
    // Date picker untuk transaksi
    const dateInput = document.getElementById('tgl-transaksi');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            selectedTransaksiDate = this.value;
            updateDateDisplay();
        });
    }
    
    // Quick date buttons
    const quickDateButtons = document.querySelectorAll('.quick-date-btn');
    quickDateButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const days = parseInt(this.dataset.days);
            const date = new Date();
            date.setDate(date.getDate() + days);
            selectedTransaksiDate = date.toISOString().split('T')[0];
            document.getElementById('tgl-transaksi').value = selectedTransaksiDate;
            updateDateDisplay();
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
            Swal.fire({
                icon: 'error',
                title: 'PIN Salah',
                text: 'Periksa kembali PIN Anda',
                showConfirmButton: false,
                timer: 1500
            });
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
        const roleNames = { kasir: 'Kasir', admin: 'Administrator', owner: 'Owner' };
        roleDisplay.textContent = `Mode: ${roleNames[role]}`;
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
};

window.logout = () => {
    if (cart.length > 0) {
        Swal.fire({
            title: 'Keluar Aplikasi?',
            text: 'Pesanan di keranjang akan hilang',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
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
function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Group by category
    const categories = [...new Set(MENU_DATA.map(item => item.cat))];
    
    categories.forEach(category => {
        // Category Header
        container.innerHTML += `
            <div class="col-12">
                <div class="menu-category">
                    <i class="fas fa-folder-open me-2"></i>${category}
                    <span class="badge bg-light text-dark ms-2">
                        ${MENU_DATA.filter(item => item.cat === category).length} item
                    </span>
                </div>
            </div>
        `;
        
        // Menu Items
        MENU_DATA
            .filter(item => item.cat === category)
            .forEach(item => {
                container.innerHTML += `
                <div class="col-6 col-md-4 col-lg-3">
                    <button class="menu-card" onclick="handleMenuClick(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <div class="menu-icon">${item.icon}</div>
                        <div class="menu-name">${item.name}</div>
                        <div class="menu-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                        ${item.hasVariant ? '<div class="menu-variant-badge"><i class="fas fa-list"></i> Varian</div>' : ''}
                        <div class="menu-add-btn">
                            <i class="fas fa-plus"></i>
                        </div>
                    </button>
                </div>
                `;
            });
    });
}

window.handleMenuClick = (item) => {
    if (item.hasVariant) {
        const modalElement = document.getElementById('indomieModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    } else {
        addToCart(item.name, item.price, item.icon);
    }
};

window.addIndomieVariant = (variantName) => {
    const modalElement = document.getElementById('indomieModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
    
    addToCart(`Indomie ${variantName}`, 7000, '🍜');
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
    
    // Visual feedback
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${name}</div>
            <div class="toast-subtitle">Ditambahkan ke keranjang</div>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
};

window.removeFromCart = (index) => {
    if (index < 0 || index >= cart.length) return;
    
    Swal.fire({
        title: 'Hapus Item?',
        text: `Apakah yakin menghapus ${cart[index].name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                cart[index].total = cart[index].quantity * cart[index].price;
            } else {
                cart.splice(index, 1);
            }
            updateCartUI();
            
            Swal.fire({
                icon: 'success',
                title: 'Dihapus',
                text: 'Item telah dihapus dari keranjang',
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 1500
            });
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
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            cart = [];
            const custNameInput = document.getElementById('cust-name');
            if (custNameInput) custNameInput.value = '';
            updateCartUI();
            
            Swal.fire({
                icon: 'success',
                title: 'Dikosongkan',
                text: 'Keranjang telah dikosongkan',
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
};

function updateCartUI() {
    const cartPanel = document.getElementById('cart-panel');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartSubtotal = document.getElementById('cart-subtotal');
    
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
    
    // Show/hide cart panel
    if (totalItems > 0) {
        cartPanel.classList.remove('d-none');
        
        // Render cart items
        cartItemsList.innerHTML = cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <div class="d-flex align-items-center">
                    <div class="cart-item-icon">${item.icon}</div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-meta">
                            <span class="cart-item-price-unit">Rp ${item.price.toLocaleString('id-ID')}</span>
                            <span class="cart-item-quantity">× ${item.quantity}</span>
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="cart-item-price">Rp ${item.total.toLocaleString('id-ID')}</span>
                    <div class="cart-item-actions">
                        <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQuantity(${index})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="increaseQuantity(${index})">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})">
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

window.increaseQuantity = (index) => {
    if (index < 0 || index >= cart.length) return;
    cart[index].quantity += 1;
    cart[index].total = cart[index].quantity * cart[index].price;
    updateCartUI();
};

window.decreaseQuantity = (index) => {
    if (index < 0 || index >= cart.length) return;
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        cart[index].total = cart[index].quantity * cart[index].price;
        updateCartUI();
    } else {
        removeFromCart(index);
    }
};

window.toggleCartDetail = () => {
    const details = document.getElementById('cart-details');
    const arrow = document.getElementById('cart-arrow');
    
    if (details && arrow) {
        details.classList.toggle('d-none');
        arrow.classList.toggle('fa-chevron-up');
        arrow.classList.toggle('fa-chevron-down');
    }
};

window.filterMenu = () => {
    const searchInput = document.getElementById('search-menu');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.menu-card').forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const parent = card.closest('.col-6, .col-md-4, .col-lg-3');
        
        if (parent) {
            parent.style.display = (query === '' || cardText.includes(query)) ? 'block' : 'none';
        }
    });
};

// ==================== ORDER PROCESSING ====================
window.processOrder = async () => {
    // Validation
    const customerNameInput = document.getElementById('cust-name');
    const paymentMethodSelect = document.getElementById('payment-method');
    const transaksiDateInput = document.getElementById('tgl-transaksi');
    
    if (!customerNameInput || !paymentMethodSelect || !transaksiDateInput) return;
    
    const customerName = customerNameInput.value.trim();
    const paymentMethod = paymentMethodSelect.value;
    const selectedDate = selectedTransaksiDate;
    
    // Basic validation
    if (cart.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Keranjang Kosong',
            text: 'Tambahkan item terlebih dahulu',
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }
    
    if (!customerName) {
        Swal.fire({
            icon: 'warning',
            title: 'Nama Pelanggan',
            text: 'Harap isi nama pelanggan',
            showConfirmButton: false,
            timer: 1500
        });
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
        // Save to Firebase
        const orderRef = await push(ref(db, `orders/${selectedDate}`), orderData);
        const orderId = orderRef.key;
        
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
            confirmButtonText: '<i class="fab fa-whatsapp"></i> Kirim Nota',
            cancelButtonText: 'Tutup',
            showCloseButton: true,
            reverseButtons: true
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
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memproses',
            text: 'Terjadi kesalahan saat menyimpan pesanan',
            showConfirmButton: false,
            timer: 2000
        });
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
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Tidak ada pesanan hari ini</p>
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
                <div class="kitchen-card">
                    <div class="kitchen-header">
                        <div class="d-flex align-items-center">
                            <div class="kitchen-customer">${order.customer}</div>
                            <div class="kitchen-id ms-2">#${key.slice(-6)}</div>
                        </div>
                        <div class="kitchen-time">${order.time}</div>
                    </div>
                    
                    <ul class="kitchen-items">
                        ${Array.isArray(order.items) ? order.items.map(item => `
                            <li>
                                <span class="kitchen-item-icon">${item.icon || '🍽️'}</span>
                                <span class="kitchen-item-name">${item.name}</span>
                                <span class="kitchen-item-quantity">×${item.quantity || 1}</span>
                            </li>
                        `).join('') : ''}
                    </ul>
                    
                    <div class="kitchen-footer">
                        <div class="kitchen-payment">
                            <i class="fas fa-wallet me-1"></i> ${order.payment || 'Tunai'}
                        </div>
                        <div class="kitchen-actions">
                            <button onclick="cancelOrder('${key}', '${order.customer}')" 
                                    class="btn btn-outline-danger btn-sm">
                                <i class="fas fa-times me-1"></i>BATAL
                            </button>
                            <button onclick="finishOrder('${key}', '${order.customer}')" 
                                    class="btn btn-success btn-sm">
                                <i class="fas fa-check me-1"></i>SELESAI
                            </button>
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
        }
        pendingOrders = pendingCount;
        
        // Show empty state if no pending orders
        if (pendingCount === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Semua pesanan selesai</p>
                </div>
            `;
        }
    });
}

function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        audio.volume = 0.3;
        audio.play();
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
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            update(ref(db, `orders/${today}/${orderId}`), { 
                status: 'done',
                finishedAt: new Date().toLocaleTimeString('id-ID'),
                finishedBy: userRole
            }).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Pesanan Selesai',
                    text: `Pesanan ${customerName} sudah siap`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500
                });
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
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            remove(ref(db, `orders/${today}/${orderId}`)).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Pesanan Dibatalkan',
                    text: `Pesanan ${customerName} telah dibatalkan`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500
                });
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
                <tr>
                    <td class="small">
                        <div class="fw-bold">${order.time || '-'}</div>
                        <small>${statusBadge}</small>
                    </td>
                    <td>
                        <div class="fw-bold">${order.customer || '-'}</div>
                        <small class="text-muted d-block">
                            ${order.summary || '-'}
                        </small>
                    </td>
                    <td class="small">
                        <span class="badge bg-light text-dark">
                            <i class="fas fa-${getPaymentIcon(order.payment)} me-1"></i>
                            ${order.payment || 'Tunai'}
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
        case 'QRIS': return 'qrcode';
        case 'Transfer': return 'university';
        case 'Kasbon': return 'file-invoice';
        default: return 'money-bill';
    }
}

window.exportPDF = () => {
    if (!window.jspdf) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'PDF library tidak tersedia',
            showConfirmButton: false,
            timer: 1500
        });
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
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(45, 106, 79);
        doc.text('WARMINDO DIPO', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text('Laporan Penjualan', 105, 25, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(formattedDate, 105, 32, { align: 'center' });
        
        // Line separator
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 38, 190, 38);
        
        // AutoTable
        doc.autoTable({
            html: '#report-table',
            startY: 45,
            theme: 'grid',
            headStyles: { 
                fillColor: [45, 106, 79],
                textColor: 255,
                fontSize: 9
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
        
        Swal.fire({
            icon: 'success',
            title: 'PDF Berhasil',
            text: 'Laporan telah diexport',
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 1500
        });
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Export Gagal',
            text: 'Terjadi kesalahan saat membuat PDF',
            showConfirmButton: false,
            timer: 2000
        });
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
        // kasir doesn't need special action
    }
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
        const modalElement = document.getElementById('indomieModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
    }
    
    // F1 for help
    if (e.key === 'F1') {
        e.preventDefault();
        showHelp();
    }
});

function showHelp() {
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
        confirmButtonText: 'Mengerti'
    });
}

// ==================== NETWORK DETECTION ====================
window.addEventListener('online', () => {
    Swal.fire({
        icon: 'success',
        title: 'Koneksi Pulih',
        text: 'Aplikasi kembali online',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
    });
});

window.addEventListener('offline', () => {
    Swal.fire({
        icon: 'warning',
        title: 'Koneksi Terputus',
        text: 'Bekerja dalam mode offline',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
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
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
});

// ==================== UTILITY FUNCTIONS ====================
window.showTransactionHistory = () => {
    Swal.fire({
        title: 'Riwayat Transaksi',
        html: `
            <div class="text-start">
                <p>Sistem sekarang mendukung transaksi di tanggal mana saja:</p>
                <ul>
                    <li>Pilih tanggal di bagian atas tab Kasir</li>
                    <li>Transaksi tanggal hari ini masuk ke antrian dapur</li>
                    <li>Transaksi tanggal lain langsung masuk arsip</li>
                    <li>Semua transaksi bisa dilihat di tab Laporan</li>
                </ul>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Mengerti'
    });
};

// ==================== EXPORT GLOBALS ====================
window.selectedTransaksiDate = selectedTransaksiDate;