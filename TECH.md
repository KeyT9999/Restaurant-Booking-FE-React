# 🍽️ BookEat Frontend — Công Nghệ Sử Dụng

## Tổng Quan

Frontend của dự án **BookEat** được xây dựng bằng React với Vite, cung cấp giao diện người dùng cho ứng dụng đặt bàn nhà hàng.

---

## 🛠️ Ngôn Ngữ & Runtime

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **JavaScript (JSX)** | ES Module | Ngôn ngữ lập trình chính, dùng cú pháp JSX cho React |
| **Node.js** | LTS | Môi trường runtime cho quá trình build & phát triển |

---

## 📦 Framework & Thư Viện Chính

### Dependencies (Production)

| Tên | Phiên bản | Mục đích sử dụng |
|-----|-----------|-----------------|
| **React & React DOM** | ^19.2.6 | Thư viện cốt lõi để xây dựng và render giao diện người dùng |
| **Tailwind CSS v4** | ^4.3.0 | Framework CSS utility-first dùng cho toàn bộ hệ thống giao diện |
| **@radix-ui/* (Radix UI)** | ^1.2.0 | Bộ Radix Primitives làm nền tảng cho base components |
| **React Router DOM** | ^7.15.1 | Định tuyến và chuyển trang cho 44+ màn hình nghiệp vụ |
| **Axios** | ^1.16.1 | Gửi yêu cầu HTTP kết nối tới 90+ endpoints Backend API |
| **Socket.io-client** | ^4.8.3 | Kết nối realtime cho chat và thông báo tức thời |
| **Recharts** | ^3.8.1 | Vẽ biểu đồ thống kê xu hướng cho Admin và Owner Dashboards |
| **React Hook Form** | ^7.76.0 | Xử lý biểu mẫu đăng ký, đặt bàn và cấu hình thông tin |
| **Lucide React** | ^1.16.0 | Thư viện icon vector đồng bộ |
| **Sonner & React Hot Toast** | ^2.0.7 | Quản lý thông báo toast tức thời |

### Dev Dependencies (Phát Triển)

| Tên | Phiên bản | Mục đích sử dụng |
|-----|-----------|-----------------|
| **Vite** | ^8.0.12 | Build tool và máy chủ phát triển cục bộ |
| **@tailwindcss/vite** | ^4.3.0 | Plugin tích hợp Tailwind CSS v4 với Vite |
| **@vitejs/plugin-react** | ^6.0.1 | Hỗ trợ React Fast Refresh |
| **ESLint** | ^10.3.0 | Kiểm tra cú pháp và chất lượng mã nguồn |

---

## ⚙️ Công Cụ Build & Cấu Hướng

| Công cụ | File cấu hình | Mô tả |
|---------|---------------|-------|
| **Vite** | `vite.config.js` | Quản lý bundler, plugins React và Tailwind CSS v4 |
| **ESLint** | `eslint.config.js` | Quy tắc kiểm duyệt code, đảm bảo tiêu chuẩn React Hooks |

---

## 🗂️ Cấu Trúc Dự Án

```
BookEat_FE_React/
├── public/               # Tài nguyên tĩnh (favicon, ảnh, v.v.)
├── src/
│   ├── api/              # Định nghĩa các cuộc gọi API (auth, booking, chat, menu, v.v.)
│   ├── assets/           # Tài nguyên tĩnh nội bộ (font, hình ảnh mặc định)
│   ├── components/       # Các components dùng chung và riêng biệt
│   │   ├── admin/        # Component quản trị (Timeline, Modals kiểm duyệt)
│   │   ├── bookeat/      # Component thương hiệu (StatusBadge, StatCard, Section)
│   │   ├── layout/       # Sidebar, TopBar, Navbar phân chia theo Roles
│   │   ├── owner/        # Component chủ nhà hàng (Restaurant form steps, switcher)
│   │   └── ui/           # Base components port từ Radix (Button, Dialog, Select, etc.)
│   ├── context/          # Quản lý trạng thái toàn cục (Auth, Chat, Restaurant)
│   ├── hooks/            # Custom hooks cho Chat Sockets và Notifications
│   ├── pages/            # 44 trang nghiệp vụ của Customer, Owner, và Admin
│   ├── App.jsx           # Component định nghĩa định tuyến (Routing)
│   ├── main.jsx          # Entry point render ứng dụng vào DOM
│   └── index.css         # Chứa Tailwind directives và các CSS variables theme tối
├── vite.config.js        # Cấu hình Vite
├── eslint.config.js      # Cấu hình linter
├── package.json          # Khai báo packages & scripts
└── design.md             # Đặc tả design system canonical của BookEat
```

---

## 📋 Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi chạy máy chủ phát triển cục bộ |
| `npm run build` | Biên dịch tối ưu mã nguồn cho production |
| `npm run preview` | Chạy thử nghiệm bản build production cục bộ |
| `npm run lint` | Quét và phát hiện lỗi cú pháp mã nguồn |

---

## 🚀 Khởi Chạy Dự Án

```bash
# Cài đặt toàn bộ dependencies
npm install

# Chạy ở chế độ phát triển
npm run dev

# Kiểm tra cú pháp mã nguồn
npm run lint

# Build production
npm run build
```

---

*Cập nhật lần cuối: 2026-06-16*

