# POS Single-Store Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=flat-square)](LICENSE)

Aplikasi Web Point of Sale (POS) & Manajemen Toko Tunggal (*Single-Store*) yang cepat, responsif, dan kaya fitur. Dirancang untuk memberikan solusi kasir terintegrasi bagi toko ritel, minimarket, cafe, atau usaha mandiri yang membutuhkan sistem pengelolaan penjualan, persediaan barang, serta keuangan dalam satu tempat.

---

## 🚀 Fitur Utama

- 🛒 **Point of Sale (Kasir & Checkout)**
  - Pencarian produk cepat & kompatibilitas barcode scanner.
  - Manajemen keranjang (*cart*) real-time menggunakan Zustand.
  - Pembayaran multi-metode (Tunai, QRIS, Transfer, Kartu).
  - Cetak struk kasir langsung ke printer thermal via QZ Tray.

- 📦 **Katalog & Manajemen Produk**
  - Pengelolaan produk, kategori, dan brand/merek.
  - Pengaturan harga jual, harga beli, varian, serta SKU barang.

- 📊 **Manajemen Stok & Opname**
  - Monitoring stok persediaan produk secara real-time.
  - Penyesuaian stok fisik (Stock Opname) beserta pencatatan alasan selisih stok.
  - Peringatan stok minimum / menipis.

- 💵 **Sesi Kas & Cash Drawer**
  - Buka/Tutup sesi kasir (Shift Cash Drawer).
  - Pencatatan kas masuk & kas keluar (*cash in / cash out*).
  - Rekonsiliasi kas awal dan kas akhir di akhir shift.

- 📜 **Transaksi Penjualan & Struk**
  - Riwayat lengkap transaksi penjualan.
  - Cetak ulang struk (*re-print receipt*) menggunakan format ESC/POS.
  - Pembatalan transaksi & penanganan retur barang.

- 🚚 **Pengadaan & Pembelian (Purchase Orders & Suppliers)**
  - Manajemen data pemasok (*suppliers*).
  - Pembelian produk (*Purchase Order*) dan penerimaan barang untuk menambah stok.

- 📊 **Laporan & Akuntansi**
  - Dashboard visual penjualan dan analisis pendapatan (Recharts).
  - Pencatatan pengeluaran operasional toko (*expenses*).
  - Manajemen hutang & piutang (*debts & receivables*).

- 👥 **User & Member Management**
  - Hak akses berbasis peran (Admin, Manajer, Kasir).
  - Pengelolaan pelanggan / member program toko.

- ⚡ **PWA & Offline Support**
  - Kemampuan Progressive Web App (PWA) via `@serwist/next`.
  - Caching data lokal & IndexedDB melalui `dexie`.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), Radix UI Primitives
- **Ikon & Animasi**: [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler.io/icons), [Framer Motion](https://framer.com/motion)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client & Cart State)
- **Data Fetching**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Autentikasi**: [NextAuth.js v5](https://authjs.dev/)
- **Offline Storage**: [Dexie.js](https://dexie.org/) (IndexedDB) & [Serwist](https://serwist.pages.dev/) (PWA Service Worker)
- **Cetak Struk Thermal**: [QZ Tray](https://qz.io/) (`qz-tray`) & `ReceiptFormatter` (ESC/POS)

---

## 📂 Struktur Proyek

```text
src/
├── app/                  # Route Handlers & Halaman Utama (Next.js App Router)
│   ├── (auth)/           # Route Login / Autentikasi
│   ├── (protected)/      # Route Terlindungi (Dashboard, Kasir, Admin)
│   ├── api/              # API Route Handlers internal
│   └── sw.ts             # Service Worker (PWA Serwist)
├── components/           # Komponen UI global (Shadcn UI, Reusable Primitives)
├── config/               # Konfigurasi aplikasi & navigasi
├── constants/            # Enum & konstanta global
├── features/             # Modul Fitur (products, checkout, stock, transactions, dll.)
│   ├── products/         # Pengelolaan data produk & inventaris
│   ├── checkout/         # Fitur kasir & transaksi
│   └── ...               # Modul fitur lainnya
├── hooks/                # Custom React Hooks
├── lib/                  # Library & API client setup
├── providers/            # React Context Providers
├── services/             # Layer Layanan Eksternal (Printer QZ Tray, dll.)
├── stores/               # State Store (Zustand)
├── styles/               # CSS & Styling Tailwind
├── types/                # TypeScript Interfaces & Type Declarations
└── utils/                # Utility Helpers (ReceiptFormatter, Format Angka/Tanggal)
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat

- [Node.js](https://nodejs.org/) v20+ atau [Bun](https://bun.sh/)
- Backend Service API (POS Backend API)

### 1. Clone Repository

```bash
git clone https://github.com/MitrasovaDigitalSolutions/pos-frontend-singlestore.git
cd pos-frontend-singlestore
```

### 2. Install Dependensi

Menggunakan Bun (direkomendasikan):
```bash
bun install
```

Atau menggunakan npm:
```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di root direktori proyek dan sesuaikan variabel berikut:

```env
NEXT_PUBLIC_API_URL=https://****
NEXTAUTH_SECRET=****
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Jalankan Development Server

```bash
bun dev
# atau
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 5. Build untuk Produksi

```bash
bun run build
bun run start
# atau
npm run build
npm run start
```

---

## 🖨️ Integrasi Printer Struk Thermal (QZ Tray)

1. Unduh dan install aplikasi **[QZ Tray](https://qz.io/download/)** di komputer kasir.
2. Hubungkan printer thermal (USB / Bluetooth / LAN) dan pastikan driver printer sudah terinstal di OS.
3. Saat melakukan checkout atau cetak ulang struk di aplikasi POS, perintah cetak ESC/POS akan langsung dikirimkan ke printer thermal melalui QZ Tray.

---

## 📄 Lisensi & Hak Cipta

Hak Cipta © 2026 **Mitrasova Digital Solutions**. Seluruh Hak Dilindungi Undang-Undang (*All Rights Reserved*).

Perangkat lunak ini berada di bawah lisensi **Proprietary / Hak Cipta Hak Milik** ([LICENSE](LICENSE)). Kode sumber ini **TIDAK BOLEH** diperjualbelikan, disewakan, diubah/dimodifikasi, maupun didistribusikan ulang tanpa izin tertulis dari Mitrasova Digital Solutions.
