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
| **React** | ^19.2.6 | Thư viện xây dựng giao diện người dùng (UI) |
| **React DOM** | ^19.2.6 | Render React vào DOM của trình duyệt |
| **Tailwind CSS** | ^4.3.0 | Framework CSS utility-first để styling |
| **@tailwindcss/vite** | ^4.3.0 | Plugin tích hợp Tailwind CSS với Vite |

### Dev Dependencies (Phát Triển)

| Tên | Phiên bản | Mục đích sử dụng |
|-----|-----------|-----------------|
| **Vite** | ^8.0.12 | Build tool & dev server cực nhanh |
| **@vitejs/plugin-react** | ^6.0.1 | Plugin Vite hỗ trợ React (Babel/SWC) |
| **ESLint** | ^10.3.0 | Công cụ kiểm tra chất lượng mã nguồn (linting) |
| **eslint-plugin-react-hooks** | ^7.1.1 | Kiểm tra quy tắc React Hooks |
| **eslint-plugin-react-refresh** | ^0.5.2 | Hỗ trợ Fast Refresh khi phát triển |
| **@eslint/js** | ^10.0.1 | Cấu hình ESLint cốt lõi cho JavaScript |
| **@types/react** | ^19.2.14 | Định nghĩa kiểu dữ liệu cho React |
| **@types/react-dom** | ^19.2.3 | Định nghĩa kiểu dữ liệu cho React DOM |
| **globals** | ^17.6.0 | Danh sách biến toàn cục cho ESLint |

---

## ⚙️ Công Cụ Build & Cấu Hình

| Công cụ | File cấu hình | Mô tả |
|---------|---------------|-------|
| **Vite** | `vite.config.js` | Build tool chính, cấu hình plugins React & Tailwind |
| **ESLint** | `eslint.config.js` | Quy tắc kiểm tra code |

---

## 🗂️ Cấu Trúc Dự Án

```
BookEat_FE_React/
├── public/               # Tài nguyên tĩnh (favicon, ảnh công khai)
├── src/
│   ├── assets/           # Tài nguyên (hình ảnh, font, icon...)
│   ├── App.jsx           # Component gốc của ứng dụng
│   ├── App.css           # Style cho App component
│   ├── main.jsx          # Entry point — render React vào DOM
│   └── index.css         # Style toàn cục & Tailwind directives
├── index.html            # HTML template
├── vite.config.js        # Cấu hình Vite
├── eslint.config.js      # Cấu hình ESLint
├── package.json          # Cấu hình dự án & dependencies
├── package-lock.json     # Lock file đảm bảo version nhất quán
└── .gitignore            # Danh sách file/thư mục không commit
```

---

## 📋 Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi chạy dev server (Hot Module Replacement) |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview bản build production |
| `npm run lint` | Kiểm tra lỗi code với ESLint |

---

## 🚀 Khởi Chạy Dự Án

```bash
# Cài đặt dependencies
npm install

# Chạy ở chế độ phát triển
npm run dev

# Build production
npm run build
```

---

## 🔮 Công Nghệ Dự Kiến Bổ Sung

> Các công nghệ có thể được tích hợp trong quá trình phát triển:

- **Routing**: React Router DOM
- **State Management**: Redux Toolkit / Zustand / Context API
- **HTTP Client**: Axios / Fetch API
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify
- **Icons**: React Icons / Lucide React

---

*Cập nhật lần cuối: 2026-05-21*
