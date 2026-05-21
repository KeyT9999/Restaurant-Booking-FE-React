# 🍽️ BookEat FE — Design System & Coding Guide

> **Theme:** Amrit Palace — Opulent Old-World Canvas  
> Mọi thành viên trong team **BẮT BUỘC** đọc và tuân theo tài liệu này trước khi viết code UI.

---

## 1. Tổng quan phong cách

BookEat dùng design system **Amrit Palace** — gợi lên trải nghiệm ẩm thực cao cấp, hoài cổ, sang trọng:

- **Nền tối** (`#2c2c2c`) làm canvas chính
- **Chữ màu parchment** (`#d8cbb8`) — ấm áp, không chói
- **Accent vàng amber** (`#d49653`) — dùng rất tiết kiệm cho điểm nhấn
- **Typography**: Display serif (Playfair Display) cho tiêu đề lớn + sans-serif (Inter) cho body
- **Border-radius**: `0px` cho card/layout, `3px` cho input/interactive nhỏ
- **Không có shadow nặng** — dùng border mỏng + background shift để tạo độ sâu

---

## 2. Design Tokens — CSS Variables

Tất cả tokens được khai báo trong [`src/App.css`](./src/App.css) (`:root`).  
**Không được hardcode màu hay kích thước** — luôn dùng token.

```css
/* === COLORS === */
--color-mahogany:       #2c2c2c;   /* Text chính, dark bg */
--color-aged-parchment: #d8cbb8;   /* Text phụ, border, surface sáng */
--color-amber-glow:     #d49653;   /* Accent — dùng ít thôi! */
--color-soft-linen:     #dfdad5;   /* Hover state cho btn-primary */
--color-faded-stone:    #b6ab9c;   /* Text mờ, placeholder, label */

/* === SURFACES === */
--surface-0: #2c2c2c;   /* Background trang chính (dark) */
--surface-1: #d8cbb8;   /* Background section sáng */
--surface-2: #dfdad5;   /* Background nhạt nhất */

/* === TYPOGRAPHY === */
--font-display: 'Playfair Display', 'Georgia', serif;
--font-body:    'Inter', ui-sans-serif, system-ui, sans-serif;

--font-weight-light:  300;  /* Playfair Display headings */
--font-weight-medium: 500;  /* Inter body/nav */
--font-weight-bold:   700;  /* Inter button/label */

/* === TYPE SCALE === */
--text-caption:    12px;
--text-body-sm:    13px;
--text-body:       14px;
--text-body-lg:    15px;
--text-heading-sm: 42px;

/* === SPACING === */
--spacing-4:   4px;
--spacing-6:   6px;
--spacing-8:   8px;
--spacing-10:  10px;
--spacing-12:  12px;
--spacing-16:  16px;
--spacing-20:  20px;
--spacing-24:  24px;
--spacing-28:  28px;
--spacing-32:  32px;
--spacing-42:  42px;
--spacing-62:  62px;   /* khoảng cách giữa sections */
--spacing-92:  92px;

/* === BORDER RADIUS === */
--radius-card: 0px;   /* Card, modal, layout block */
--radius-sm:   3px;   /* Input, badge, tag nhỏ */
```

---

## 3. Typography — Quy tắc sử dụng

### Font chữ

| Dùng cho | Font | Weight | Class/CSS |
|---|---|---|---|
| Tiêu đề lớn (h1, hero) | `--font-display` (Playfair Display) | 300 | `font-family: var(--font-display); font-weight: 300` |
| Tiêu đề section (h2) | `--font-display` | 300 | `font-weight: var(--font-weight-light)` |
| Feature card title (h3) | `--font-display` | 300 | 26px |
| Body text, nav, button | `--font-body` (Inter) | 500 | `font-family: var(--font-body)` |
| Label uppercase | `--font-body` | 500 | + `letter-spacing: 0.1em; text-transform: uppercase` |
| Button text | `--font-body` | 700 | `font-weight: var(--font-weight-bold)` |

### Quy tắc letter-spacing

```
Heading lớn (65px+)  → letter-spacing: -0.035em
Heading vừa (26-42px) → letter-spacing: -0.02em
Body-lg (15px)       → letter-spacing: -0.012em
Body (14px)          → letter-spacing: -0.011em
Body-sm (13px)       → letter-spacing: -0.010em
Caption (12px)       → letter-spacing: +0.01em (hoặc +0.1em nếu uppercase)
Eyebrow uppercase    → letter-spacing: 0.10em ~ 0.12em
```

### Ví dụ thực tế từ code

```css
/* Hero H1 */
.hero-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-light);   /* 300 */
  font-size: clamp(48px, 6vw, 92px);
  line-height: 0.88;
  letter-spacing: -0.035em;
  color: var(--color-aged-parchment);
}

/* Section H2 */
.section-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-light);
  font-size: clamp(36px, 5vw, 65px);
  line-height: 0.9;
  letter-spacing: -0.03em;
}

/* Eyebrow label */
.section-eyebrow {
  font-family: var(--font-body);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-caption);          /* 12px */
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-amber-glow);
}
```

---

## 4. Components — Quy chuẩn

### 4.1 Buttons

#### `.btn-primary` — CTA chính

```css
background: var(--color-aged-parchment);
color: var(--color-mahogany);
padding: var(--spacing-20) var(--spacing-32);
border-radius: var(--radius-card);          /* 0px */
font-weight: var(--font-weight-bold);       /* 700 */
font-size: var(--text-body-lg);             /* 15px */
letter-spacing: -0.012em;
/* Hover */
background: var(--color-soft-linen);
```

#### `.btn-outline` — Secondary action

```css
border: 1px solid var(--color-aged-parchment);
color: var(--color-aged-parchment);
background: transparent;
padding: var(--spacing-20) var(--spacing-28);
border-radius: var(--radius-card);          /* 0px */
/* Hover */
background: var(--color-aged-parchment);
color: var(--color-mahogany);
```

#### `.btn-ghost` — Text action

```css
background: transparent;
border: none;
color: var(--color-aged-parchment);
padding: var(--spacing-20) 0;              /* no horizontal padding */
/* Hover */
color: var(--color-mahogany);
background: var(--color-amber-glow);
```

> ⚠️ **KHÔNG** dùng border-radius lớn cho button. Luôn dùng `--radius-card` (0px).

---

### 4.2 Cards

```css
/* Card tối chuẩn */
background: rgba(30, 26, 22, 0.9);
border: 1px solid rgba(216, 203, 184, 0.2);
border-radius: var(--radius-card);   /* 0px */
/* KHÔNG có box-shadow */

/* Hover: background shift nhẹ, KHÔNG elevation */
background: rgba(212, 150, 83, 0.04);
```

#### Grid card layout (feature, category)

```css
/* Dùng gap: 1px với background là border color — thay cho border từng item */
display: grid;
grid-template-columns: repeat(N, 1fr);
gap: 1px;
background: rgba(216, 203, 184, 0.1);   /* màu gap = border */
border: 1px solid rgba(216, 203, 184, 0.1);
```

---

### 4.3 Form Inputs

```css
/* Input field */
background: rgba(44, 44, 44, 0.6);
border: 1px solid rgba(216, 203, 184, 0.2);
border-radius: var(--radius-sm);   /* 3px */
color: var(--color-aged-parchment);
padding: var(--spacing-16);
font-size: var(--text-body-lg);

/* Focus */
border-color: var(--color-amber-glow);
background: rgba(44, 44, 44, 0.9);
outline: none;

/* Error */
border-color: rgba(200, 114, 114, 0.6);
```

---

### 4.4 Navigation Header

```css
/* Header bar */
position: sticky; top: 0; z-index: 50;
height: 68px~72px;
background: rgba(30, 26, 22, 0.96);
border-bottom: 1px solid rgba(216, 203, 184, 0.12);
backdrop-filter: blur(12px);

/* Nav link */
font-size: var(--text-body);
font-weight: var(--font-weight-medium);
color: var(--color-faded-stone);
/* Active/hover */
color: var(--color-aged-parchment);
```

---

### 4.5 Section Layout

```css
/* Container chuẩn */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-42);   /* 42px ngang */
}

/* Section padding */
.section {
  padding: var(--spacing-92) 0;   /* 92px dọc */
}

/* Khoảng cách giữa section-eyebrow và section-title */
margin-bottom: var(--spacing-16);

/* Khoảng cách giữa section-title và content */
margin-bottom: var(--spacing-42);
```

---

### 4.6 Eyebrow + Section Title (Pattern chuẩn)

Mọi section đều dùng pattern này:

```jsx
<span className="section-eyebrow">Label ngắn</span>
<h2 className="section-title">Tiêu đề section</h2>
<p className="section-sub">Mô tả ngắn tuỳ chọn</p>
```

```css
.section-eyebrow → 12px uppercase, amber-glow, letter-spacing 0.12em
.section-title   → display font, 300, clamp(36-65px), line-height 0.9
.section-sub     → 15px, faded-stone, line-height 1.5, max-width 480px
```

---

### 4.7 Alert / Notification

```css
/* Error */
border: 1px solid rgba(200, 114, 114, 0.3);
background: rgba(200, 114, 114, 0.08);
color: #c87272;
border-radius: var(--radius-sm);   /* 3px */

/* Warning/Info (amber) */
border: 1px solid rgba(212, 150, 83, 0.3);
background: rgba(212, 150, 83, 0.08);
color: var(--color-aged-parchment);
```

---

## 5. File Structure — Quy ước tổ chức

```
src/
├── App.css              ← ⭐ Design tokens (:root) — chỉnh ở đây
├── index.css            ← Reset CSS — không thêm style trang trí
├── api/                 ← Chỉ gọi HTTP, không logic UI
├── components/
│   ├── Header.jsx       ← Shared navigation
│   └── Header.css       ← CSS đặt cùng file component
├── context/             ← AuthContext, useAuth — không UI
├── pages/
│   ├── home/
│   │   ├── HomePage.jsx
│   │   └── HomePage.css ← CSS riêng của trang
│   └── auth/
│       ├── Login.jsx
│       ├── Register.jsx
│       └── ...
└── styles/
    └── auth.css         ← CSS dùng chung cho nhiều trang auth
```

### Quy tắc CSS

| Rule | Chi tiết |
|---|---|
| **Mỗi page/component có file CSS riêng** | `HomePage.css`, `Header.css` — import trong JSX |
| **CSS dùng chung** | Đặt trong `styles/` — import vào những file cần |
| **Tokens** | Chỉ định nghĩa ở `App.css :root`, dùng `var()` ở mọi nơi |
| **Không inline style** | Tránh `style={{ color: '#d49653' }}` — dùng class |
| **Ngoại lệ inline style** | Chỉ cho giá trị **động** từ JS (width%, translate từ state) |
| **Không Tailwind** | Dự án dùng Vanilla CSS thuần |

---

## 6. Animation & Interaction

```css
/* Transition chuẩn cho hover */
transition: background 0.2s, color 0.2s;   /* button */
transition: border-color 0.18s, background 0.18s;  /* input */
transition: color 0.18s;   /* link */

/* Float animation (hero cards) */
@keyframes floatCard {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
animation: floatCard 5s ease-in-out infinite;

/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

> **KHÔNG** dùng animation mạnh, bounce, hay scale lớn. Giữ subtle và elegant.

---

## 7. Responsive

| Breakpoint | Target | Thay đổi chính |
|---|---|---|
| `max-width: 960px` | Tablet | Hero 1 cột, ẩn hero-visual, container padding giảm |
| `max-width: 720px` | Mobile tablet | Auth card padding giảm, options flex-col |
| `max-width: 600px` | Mobile | Section padding 60px, grid 2 cột, buttons full-width |

```css
/* Container padding mobile */
@media (max-width: 960px) {
  .container { padding: 0 var(--spacing-24); }
}
```

---

## 8. DO's and DON'Ts

### ✅ DO

- Luôn dùng `var(--token)` cho màu, spacing, font
- Playfair Display weight **300** cho heading lớn (≥ 26px)
- Amber Glow (`#d49653`) chỉ cho: eyebrow label, accent border, focus highlight, icon hover
- Border-radius `0px` cho card/layout, `3px` cho input/badge
- Transition nhẹ `0.18s ~ 0.2s` cho hover
- Fallback text mờ (`--color-faded-stone`) cho placeholder, caption, secondary text
- `backdrop-filter: blur(12px)` cho overlay/header có background semi-transparent
- Grid `gap: 1px` với background = border color cho card grid (không dùng border từng cell)

### ❌ DON'T

- ~~Hardcode màu~~ (`color: #d49653` → dùng `var(--color-amber-glow)`)
- ~~Màu rực rỡ~~ ngoài palette (đỏ, xanh lam, tím...)
- ~~Box-shadow nặng~~ — design dùng border mỏng + bg shift
- ~~Border-radius lớn~~ (8px, 12px, 50%) cho card/button
- ~~Line-height 0.8~~ cho body text — dùng 1.3 ~ 1.6
- ~~Nhiều font~~ — chỉ 2 font: Playfair Display + Inter
- ~~Tailwind class~~ — dự án dùng Vanilla CSS

---

## 9. Màu dùng cho Hero/Section Background

```css
/* Hero dark overlay */
background:
  linear-gradient(to bottom, rgba(30,26,22,0.6) 0%, rgba(10,9,7,0.95) 100%),
  url('/src/assets/hero.png') center / cover;

/* Categories section */
background: #1e1a16;   /* tối hơn surface-0 một chút */

/* CTA section */
background: #1e1a16;

/* Footer */
background: #131110;   /* tối nhất */

/* Divider border */
border: 1px solid rgba(216, 203, 184, 0.1);   /* parchment 10% opacity */
```

---

## 10. Quy ước đặt tên class CSS

```
[component]-[element]        → .hero-title, .hero-eyebrow, .card-title
[component]-[modifier]       → .btn-primary, .btn-outline, .auth-alert-error
[state]-[element]            → (dùng :hover, :focus, :disabled pseudo-class)
section wrapper              → .section, .container
```

> Dùng **kebab-case** cho tất cả class. Không dùng camelCase hay BEM phức tạp.

---

## 11. Commit message convention

```
feat: thêm trang RestaurantDetail
fix: sửa lỗi login khi chưa verify email
style: cập nhật spacing section Features
refactor: tách AuthInput thành component riêng
```

---

## 12. Tham khảo code thực tế

| File | Xem ví dụ về |
|---|---|
| [`src/App.css`](./src/App.css) | Toàn bộ design tokens |
| [`src/pages/home/HomePage.css`](./src/pages/home/HomePage.css) | Button, hero, section, grid, responsive |
| [`src/pages/home/HomePage.jsx`](./src/pages/home/HomePage.jsx) | JSX pattern: eyebrow → title → grid |
| [`src/styles/auth.css`](./src/styles/auth.css) | Form input, card tối, alert, modal |
| [`src/pages/auth/Login.jsx`](./src/pages/auth/Login.jsx) | Pattern form với icon + label |
| [`src/pages/auth/Register.jsx`](./src/pages/auth/Register.jsx) | Component AuthInput, PasswordInput tái sử dụng |
| [`src/components/Header.jsx`](./src/components/Header.jsx) | Sticky nav, dropdown, auth state handling |

---

*Cập nhật lần cuối: 2026-05-21 — Mọi thắc mắc hỏi lead trước khi tự sửa tokens.*
