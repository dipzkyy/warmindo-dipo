# Warmindo Dipo PRO v4.0

Sistem kasir modern untuk Warmindo Dipo dengan UI/UX terbaru yang lebih keren dan scalable.

## ✨ Fitur Baru v4.0

### 🎨 **UI Modern & Responsif**
- Glassmorphism design dengan efek transparan
- Gradient colors yang eye-catching
- Animasi smooth dengan Animate.css
- Responsif untuk semua perangkat
- Dark/Light mode ready

### 📱 **Menu Minuman Diperbarui**
- **Nutrisari Jeruk** dibagi menjadi 3:
  - Jeruk Peras (Panas/Dingin)
  - Jeruk Nipis (Panas/Dingin)
  - Jeruk Manis (Panas/Dingin)
- **Es Batu** dihapus (free)
- Minuman selain kopi memiliki opsi **Panas/Dingin**
- Kopi tetap tanpa opsi suhu

### 🔄 **Transaksi Multi-Tanggal**
- Bisa transaksi untuk hari ini, kemarin, atau tanggal apapun
- Sistem otomatis membedakan:
  - Transaksi hari ini → masuk antrian dapur
  - Transaksi tanggal lain → langsung arsip
- Tombol cepat untuk navigasi tanggal

### 🚀 **Performance Optimized**
- Code lebih modular dan scalable
- Lazy loading untuk komponen
- Efficient state management
- Minimal re-renders

## 🎯 Fitur Utama

### 1. **Three-Tier Authentication**
   - **Kasir** (1234) - Basic transactions
   - **Admin** (1337) + Reports
   - **Owner** (9999) - Full access

### 2. **Smart Menu System**
   - 4 categories: Makanan, Topping, Camilan, Minuman
   - Indomie dengan 7 varian
   - Color-coded items untuk visual recognition
   - Category tabs untuk navigasi cepat

### 3. **Real-time Kitchen Queue**
   - Live order tracking
   - Sound notifications for new orders
   - Quick action buttons
   - Order status management

### 4. **Advanced Reporting**
   - Daily revenue statistics
   - Transaction analytics
   - Date filtering
   - PDF export

### 5. **Progressive Web App**
   - Installable on mobile/desktop
   - Works offline
   - Push notifications ready
   - Fast loading

## 🛠️ Teknologi Stack
- **Frontend**: HTML5, CSS3 (Custom Properties), JavaScript ES6+
- **UI Framework**: Bootstrap 5 + Custom Components
- **Icons**: Font Awesome 6
- **Animations**: Animate.css
- **Notifications**: SweetAlert2
- **PDF Export**: jsPDF + AutoTable
- **Database**: Firebase Realtime
- **PWA**: Service Workers, Manifest

## 📁 File Structure