---
name: BookEat
description: Amrit Palace — Opulent Old-World Canvas
colors:
  mahogany: "#2c2c2c"
  aged-parchment: "#d8cbb8"
  amber-glow: "#d49653"
  soft-linen: "#dfdad5"
  faded-stone: "#b6ab9c"
typography:
  display:
    fontFamily: "'Playfair Display', 'Georgia', serif"
    fontWeight: 300
  body:
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"
    fontWeight: 500
  label:
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"
    fontWeight: 500
    letterSpacing: "0.1em"
  button:
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
rounded:
  card: "0px"
  sm: "3px"
spacing:
  "4": "4px"
  "6": "6px"
  "8": "8px"
  "10": "10px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "42": "42px"
  "62": "62px"
  "92": "92px"
components:
  button-primary:
    backgroundColor: "{colors.aged-parchment}"
    textColor: "{colors.mahogany}"
    rounded: "{rounded.card}"
    padding: "20px 32px"
  button-primary-hover:
    backgroundColor: "{colors.soft-linen}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.aged-parchment}"
    rounded: "{rounded.card}"
    padding: "20px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.aged-parchment}"
    padding: "20px 0"
---

# Design System: BookEat

## 1. Overview

**Creative North Star: "Amrit Palace — Opulent Old-World Canvas"**

BookEat dùng design system **Amrit Palace** — gợi lên trải nghiệm ẩm thực cao cấp, hoài cổ, sang trọng. Thiết kế tuân theo triết lý tối giản về màu sắc với nền canvas tối, sử dụng điểm nhấn màu vàng amber một cách có chủ đích. Hình khối góc cạnh (0px border-radius) mang lại cảm giác cổ điển, trang trọng, kết hợp với typography tương phản mạnh giữa nét mảnh của Playfair Display và nét đều của Inter.

**Key Characteristics:**
- **Nền tối** làm canvas chính, làm nổi bật nội dung.
- Không sử dụng các màu rực rỡ (đỏ, xanh lam, tím...).
- **Không có shadow nặng** — dùng border mỏng + background shift để tạo độ sâu.
- Các chi tiết tương tác (input, badge) có góc bo nhẹ (3px) để báo hiệu khả năng click.

## 2. Colors

Bảng màu giới hạn và mang hơi hướng cổ điển, sử dụng các tone màu của giấy da và gỗ.

### Primary
- **Amber Glow** (#d49653): Accent color. Điểm nhấn mạnh mẽ nhưng dùng rất tiết kiệm (cho eyebrow label, accent border, focus highlight, icon hover).

### Neutral
- **Mahogany** (#2c2c2c): Nền chính (surface-0). Text chính trên các bề mặt sáng.
- **Aged Parchment** (#d8cbb8): Nền cho section sáng (surface-1). Text chính và viền trên nền tối.
- **Soft Linen** (#dfdad5): Nền sáng nhất (surface-2). Dùng làm trạng thái hover cho nút bấm primary.
- **Faded Stone** (#b6ab9c): Text phụ, placeholder, label mờ, secondary text.

### Named Rules
**Quy tắc Amber Glow.** Màu `#d49653` chỉ được dùng cho điểm nhấn. Không bao giờ dùng làm màu nền cho các khối lớn hay dùng tràn lan.
**Quy tắc nền Hero.** Hero dark overlay: linear-gradient từ rgba(30,26,22,0.6) đến rgba(10,9,7,0.95). Bố cục footer nền tối nhất (#131110), section (#1e1a16).

## 3. Typography

**Display Font:** Playfair Display (fallback: Georgia, serif)
**Body Font:** Inter (fallback: ui-sans-serif, system-ui, sans-serif)

**Character:** Sự tương phản mạnh mẽ giữa nét cổ điển, sang trọng (light serif) và hiện đại, dễ đọc (medium/bold sans-serif).

### Hierarchy
- **Display** (300, clamp(48px, 6vw, 92px), line-height: 0.88, letter-spacing: -0.035em): Tiêu đề hero/h1.
- **Headline** (300, clamp(36px, 5vw, 65px), line-height: 0.9, letter-spacing: -0.03em): Tiêu đề section (h2).
- **Title** (300, 26px, letter-spacing: -0.02em): Tiêu đề feature card (h3).
- **Body-lg** (500, 15px, letter-spacing: -0.012em): Nút bấm primary, văn bản nhấn mạnh.
- **Body** (500, 14px, letter-spacing: -0.011em): Văn bản thông thường, navigation.
- **Body-sm** (500, 13px, letter-spacing: -0.010em): Text phụ.
- **Label** (500, 12px, letter-spacing: 0.12em, uppercase): Nhãn (eyebrow) cho các phần (section-eyebrow), dùng màu amber-glow.

### Named Rules
**Quy tắc Type Scale.** Các heading lớn cần font weight mỏng (300) và khoảng cách chữ âm hẹp dần (từ -0.035em đến -0.010em). Các nhãn in hoa nhỏ bắt buộc có letter-spacing rộng (0.10em~0.12em).

## 4. Elevation

Hệ thống thiết kế không sử dụng hiệu ứng đổ bóng (box-shadow) để tạo chiều sâu. Thay vào đó, nó dựa trên thiết kế phẳng (flat) hoặc phân lớp màu sắc (tonal layering) kết hợp với border mảnh và sự thay đổi màu nền (background shift) khi tương tác.

### Named Rules
**Quy tắc Không Shadow.** Thiết kế hoàn toàn không dùng shadow nặng. Sự nổi lên (elevation) được thể hiện bằng 1px border mờ `rgba(216, 203, 184, 0.2)` và trạng thái hover bằng cách đổi nhẹ opacity hoặc dịch chuyển phần tử (Float animation: `translateY(-10px)`).

## 5. Components

Cảm giác tương tác của các element là tinh tế, chững chạc và cổ điển.

### Buttons
- **Shape:** `0px` (card radius)
- **Primary:** Background Aged Parchment (#d8cbb8), Text Mahogany (#2c2c2c). Padding `20px 32px`. Text bold 15px.
- **Hover / Focus:** Background chuyển sang Soft Linen (#dfdad5). Transition background & color 0.2s.
- **Secondary (Outline):** Border 1px Aged Parchment, background trong suốt. Hover đảo ngược (bg: Aged Parchment, text: Mahogany).
- **Tertiary (Ghost):** Text Aged Parchment, không padding ngang. Hover chữ màu Mahogany, nền Amber Glow.

### Cards / Containers
- **Corner Style:** `0px`
- **Background:** Nền tối mờ `rgba(30, 26, 22, 0.9)`.
- **Shadow Strategy:** Không shadow (áp dụng quy tắc Không Shadow).
- **Border:** `1px solid rgba(216, 203, 184, 0.2)` (Parchment mờ).
- **Hover Behavior:** Background shift thành `rgba(212, 150, 83, 0.04)`.
- **Grid Patterns:** Khi gom nhóm các card, sử dụng `gap: 1px` với nền của container là màu viền `rgba(216, 203, 184, 0.1)` thay vì gán viền cho từng phần tử nhỏ bên trong.

### Inputs / Fields
- **Style:** Nền tối mờ `rgba(44, 44, 44, 0.6)`, viền mờ `rgba(216, 203, 184, 0.2)`. **Góc bo nhẹ 3px**.
- **Focus:** Viền Amber Glow, nền tối hơn `rgba(44, 44, 44, 0.9)`, không có outline. Transition 0.18s.
- **Error:** Viền đỏ `rgba(200, 114, 114, 0.6)` với nền đỏ nhạt tương ứng `rgba(200, 114, 114, 0.08)`.

### Navigation
- **Style:** Sticky top với chiều cao 68-72px. Nền `rgba(30, 26, 22, 0.96)` với `backdrop-filter: blur(12px)`.
- **Hover:** Link có kích cỡ 14px Medium Faded Stone, khi tương tác đổi thành màu sáng Aged Parchment. Transition 0.18s.

## 6. Do's and Don'ts

### Do:
- **Do** dùng `var(--token)` cho tất cả màu sắc, khoảng cách, và font chữ trong CSS.
- **Do** sử dụng Playfair Display với font-weight `300` cho tất cả heading lớn (≥ 26px).
- **Do** giới hạn màu Amber Glow (#d49653) cho các thành phần điểm nhấn như eyebrow label, focus highlight, icon hover.
- **Do** dùng border-radius `0px` cho card và nút bấm, và `3px` cho các yếu tố nhập liệu nhỏ bé (input, badge).
- **Do** dùng transition nhẹ `0.18s ~ 0.2s` cho mọi thay đổi trạng thái (hover, focus).
- **Do** áp dụng `backdrop-filter: blur(12px)` cho header hoặc overlay có background bán trong suốt.
- **Do** tuân theo chuẩn file riêng biệt: mỗi component/page có file CSS riêng (Vanilla CSS), CSS dùng chung ở thư mục `styles/`, và token nằm ở `:root` trong `App.css`.

### Don't:
- **Don't** hardcode màu sắc trực tiếp trong CSS hay inline styles (ví dụ `color: #d49653`). Hãy dùng biến `var(--color-amber-glow)`.
- **Don't** dùng màu rực rỡ ngoài bảng màu chính (tránh tuyệt đối đỏ chót, xanh lam, tím).
- **Don't** sử dụng box-shadow nặng nề hoặc các hiệu ứng glassmorphism phức tạp (ngoại trừ header/blur cơ bản).
- **Don't** dùng các góc bo tròn lớn (8px, 12px, 50%) cho card và button. Chúng làm mất tính cổ điển của thương hiệu.
- **Don't** set line-height quá hẹp như 0.8 cho body text — body luôn phải từ 1.3 ~ 1.6 để dễ đọc.
- **Don't** kết hợp thêm font khác vào ứng dụng. Chỉ dùng đúng 2 font quy định: Playfair Display và Inter.
- **Don't** lạm dụng CSS Framework như Tailwind class trong mã nguồn. Dự án này sử dụng hoàn toàn Vanilla CSS thuần và các tokens.
- **Don't** dùng các hiệu ứng animation mạnh, bounce hay scale lớn. Giữ sự tinh tế và tĩnh lặng cho giao diện.
