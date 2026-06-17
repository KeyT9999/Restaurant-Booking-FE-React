---
name: BookEat
register: product
description: Design system va UI specification cho FE BookEat hien tai
theme: dark-only
lastUpdated: 2026-06-17
sourceOfTruth:
  implementation:
    - src/index.css
    - src/components/ui
    - src/components/Header.jsx
    - src/components/admin/AdminLayout.jsx
    - src/components/owner/OwnerLayout.jsx
    - src/pages
  figmaReference: https://indigo-shred-68942800.figma.site/
---

# BookEat FE Design System

Tai lieu nay mo ta UI hien tai cua BookEat FE React sau khi da can chinh theo huong mau Figma: nen toi sang trong, anh thuc te, typography serif cho headline, primary amber, layout rong hon va cac card co chieu sau vua phai.

Muc tieu cua `design.md` la lam source of truth cho nhung lan sua FE tiep theo. Khi co khac biet giua tai lieu nay va code, uu tien kiem tra `src/index.css`, `src/components/ui`, `src/components/Header.jsx`, `src/components/admin/AdminLayout.jsx`, `src/components/owner/OwnerLayout.jsx` va page dang lien quan.

## 1. Product Register

BookEat la san pham dat ban nha hang, gom ba nhom nguoi dung:

- Customer: tim nha hang, xem chi tiet, dat ban, quan ly lich dat, luu voucher, chat.
- Restaurant owner: quan ly nha hang, ban, mon an, booking, waitlist, voucher, refund, chat.
- Admin: quan tri nguoi dung, nha hang, booking, waitlist, voucher, doanh thu, refund, chat.

Register chinh la `product`: giao dien can tao cam giac dang tin, cao cap va san sang dung thuc te. Khong phai landing page marketing thuan tuy. Trang dau tien van la trai nghiem dat ban that, voi thanh tim kiem, danh sach nha hang va cac duong di chinh.

## 2. Design Direction

BookEat hien tai theo phong cach:

- Dark culinary editorial: nen `#0F1115`, card `#1A1D24`, border `#2C313C`.
- Premium dining: Playfair Display cho brand va title lon, Inter cho UI va noi dung.
- Warm accent: amber `#D49653` la mau chu dao cho CTA, rating, gia, icon nhan manh.
- Image-first: nha hang, mon an va voucher phai co anh thuc te hoac placeholder duoc thiet ke tot.
- Dense but calm: dashboard can de scan, public page co nhieu khoang tho hon.

Trang public nen tao cam giac nhu mot nha hang cao cap: anh nen lon, typography co tinh editorial, CTA ro rang. Dashboard nen thuc dung hon: nav trai, topbar, metric cards, bang du lieu, filter va action gan nhau.

## 3. Current Frontend Stack

- Framework: React `19.2.x`
- Build tool: Vite `8.x`
- CSS: Tailwind CSS `4.x`
- UI primitives: Radix UI, class-variance-authority, shadcn-style components
- Icons: lucide-react
- Charts: recharts
- Toast: react-hot-toast va sonner co trong dependency, code hien tai chu yeu dung react-hot-toast
- Routing: react-router-dom
- HTTP/data: axios va service layer trong `src/services`

Khong them mot design system moi neu chua can. Hay tiep tuc dung Tailwind utility, token trong `src/index.css` va cac primitive trong `src/components/ui`.

## 4. Implementation Map

### Global style

- `src/index.css`
  - Import Google Fonts: Inter va Playfair Display.
  - Khai bao token Tailwind trong `@theme inline`.
  - Chua `@layer base` cho reset va base typography.
  - La noi duy nhat nen sua token mau, font, radius va reset global.

### Shared UI

- `src/components/ui/button.jsx`: button variants va sizes.
- `src/components/ui/card.jsx`: card primitive.
- `src/components/ui/tabs.jsx`: tabs primitive.
- `src/components/ui/input.jsx`, `textarea.jsx`, `select.jsx`: form primitive.
- `src/components/ui/dialog.jsx`, `alert-dialog.jsx`: modal primitive.
- `src/components/ui/skeleton.jsx`: loading placeholder.
- `src/components/bookeat/Section.jsx`: section heading va `PhaseLabel`.

### Navigation and shells

- `src/components/Header.jsx`: public/customer header.
- `src/components/admin/AdminLayout.jsx`: admin app shell.
- `src/components/owner/OwnerLayout.jsx`: restaurant owner app shell.

### Key pages

- `src/pages/HomePage.jsx`: trang chu public.
- `src/pages/RestaurantsPage.jsx`: danh sach va filter nha hang.
- `src/pages/RestaurantDetailPage.jsx`: chi tiet nha hang, menu, ban, dat ban.
- `src/pages/BookingFormPage.jsx`: wizard dat ban.
- `src/pages/BookingsPage.jsx`: lich su dat ban cua customer.
- `src/pages/WaitlistPage.jsx`: waitlist cua customer.
- `src/pages/SavedVouchersPage.jsx`: voucher da luu.
- `src/pages/ProfilePage.jsx`: ho so customer.
- `src/pages/*Dashboard*.jsx`: cac man dashboard.
- `src/pages/admin/*`, `src/pages/owner/*`: cac page quan tri.

## 5. Non-Negotiable UI Rules

Nhung rule nay can giu de UI khong bi vo lai:

1. Global reset phai nam trong `@layer base`.
   - Khong viet selector global unlayered nhu `button { background: transparent }` ngoai layer.
   - Tailwind 4 co cascade layer, neu reset dung sai vi tri se override utility nhu `bg-primary`, `mx-auto`, `px-*`.

2. Public container dung `max-w-[1280px]`.
   - Khong quay lai `max-w-7xl` cho trang public/customer.
   - `html` dang co `font-size: 14px`, nen `max-w-7xl` chi ra khoang 1120px va lam UI bi lech, thua khoang trong ben phai.

3. Khong dung negative letter spacing.
   - `h1`, `h2` base dang `letter-spacing: 0`.
   - Neu can tao cam giac premium, tang font family, weight, line-height va spacing section, khong dung tracking am.

4. Card radius toi da mac dinh la `rounded-xl`.
   - UI primitives hien tai dung radius 8px den 12px.
   - Khong them card long nhau neu khong phai tool frame, modal hoac item lap lai.

5. Primary amber chi dung cho y nghia chinh.
   - CTA chinh, active nav, rating, gia, icon diem nhan.
   - Khong phu amber len tat ca text, border va nen cung luc.

6. Page public phai co visual asset.
   - Hero, restaurant card, detail banner, menu item va voucher nen co anh.
   - Placeholder can co icon/gradient/tone phu hop, khong de o xam phang.

7. Text phai fit tren mobile.
   - Dung responsive grid, wrap, truncate co chu dich.
   - Khong de button label dai lam vo layout.

## 6. Design Tokens

Token hien tai nam trong `src/index.css`, `@theme inline`.

### Typography tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--font-sans` | `'Inter', system-ui, sans-serif` | UI, body, form, nav, table |
| `--font-serif` | `'Playfair Display', serif` | Brand, hero title, page title, section title |

### Color tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--color-background` | `#0F1115` | App/page background |
| `--color-foreground` | `#FFFFFF` | Primary text |
| `--color-card` | `#1A1D24` | Cards, panels |
| `--color-card-foreground` | `#FFFFFF` | Text inside cards |
| `--color-popover` | `#1A1D24` | Dropdowns, menus, popovers |
| `--color-popover-foreground` | `#FFFFFF` | Popover text |
| `--color-primary` | `#D49653` | Primary CTA, active state, highlight |
| `--color-primary-foreground` | `#0F1115` | Text tren primary CTA |
| `--color-secondary` | `#20242D` | Secondary surface, muted button |
| `--color-secondary-foreground` | `#FFFFFF` | Text tren secondary |
| `--color-muted` | `#20242D` | Muted panels, subtle backgrounds |
| `--color-muted-foreground` | `#A5ADBA` | Secondary text |
| `--color-accent` | `#2C313C` | Hover surface, subtle selected bg |
| `--color-accent-foreground` | `#FFFFFF` | Text tren accent |
| `--color-border` | `#2C313C` | Border default |
| `--color-input` | `#2C313C` | Input border/background edge |
| `--color-ring` | `#D49653` | Focus ring |
| `--color-destructive` | `#EF4444` | Error, danger action |
| `--color-sidebar` | `#14171D` | Admin/owner sidebar |
| `--color-sidebar-border` | `#2C313C` | Sidebar borders |
| `--color-sidebar-accent` | `#20242D` | Sidebar hover |
| `--color-sidebar-ring` | `#D49653` | Sidebar focus/active ring |

### Status colors

| Status | Color intent | Current use |
| --- | --- | --- |
| Pending | amber/orange | `BookingCard`, `StatusBadge`, waitlist estimate |
| Confirmed | emerald | Booking confirmed, available/success states |
| Completed | zinc/slate | Historical completed state |
| Cancelled/no-show | rose/red | Cancelled, danger, unavailable |
| Info | blue/cyan when needed | Rare, only for neutral info |

Status UI phai luon co text hoac icon di kem mau. Khong chi dua vao mau.

### Radius tokens

| Token | Computed intent | Usage |
| --- | --- | --- |
| `--radius-sm` | small | Small badge, tiny control |
| `--radius-md` | medium | Button, input, nav item |
| `--radius-lg` | large | Panels, tabs, menu area |
| `--radius-xl` | extra large | Cards, image containers |

Default card primitive dung `rounded-xl`. Button primitive dung `rounded-md`.

## 7. Typography

### Global base

`src/index.css` dang dat:

- `html { font-size: 14px; }`
- `body`: Inter, background, foreground.
- `h1`: text-2xl, font-medium, line-height 1.5.
- `h2`: text-xl, font-medium, line-height 1.5.
- `h3`: text-lg, font-medium, line-height 1.5.
- `h4`: text-base, font-medium, line-height 1.5.
- `p`: text-base, font-normal, line-height 1.5.
- `h1`, `h2`: `letter-spacing: 0`.

Page-level class Tailwind se override base khi can.

### Font usage

- Playfair Display:
  - Logo `BookEat`.
  - Hero title.
  - Section title public.
  - Restaurant name tren card/detail.
  - Page title customer.
  - Khong dung cho label, button, input, nav, table.

- Inter:
  - Tat ca UI control.
  - Description, metadata, body copy.
  - Dashboard cards, table, forms.

### Type scale by context

Public hero:

- H1: `text-4xl sm:text-5xl md:text-6xl`, Playfair, line-height tight.
- Supporting copy: `text-lg md:text-xl`, muted foreground.
- Eyebrow: `PhaseLabel`, uppercase, small, tracking duong vua phai.

Public section:

- H2: `text-3xl sm:text-4xl`, Playfair.
- Subtitle: `text-muted-foreground`, max width khoang `2xl`.

Listing/detail page:

- Page title: `text-3xl sm:text-4xl`, Playfair.
- Restaurant card title: `text-xl`, Playfair.
- Metadata: `text-sm`, muted.

Dashboard:

- Topbar title/mobile title: `text-base` den `text-xl`, sans.
- Metric value: lon hon label, nhung khong dung hero-scale.
- Table text: `text-sm`.

### Copy rules

- Giu title ngan, uu tien danh tu cu the: `Noi bat tuan nay`, `Kham pha am thuc quanh ban`, `Quan ly booking`.
- Khong viet in-app text de giai thich cach dung UI neu control da ro.
- Khong noi ve framework, keyboard shortcut hoac style ben trong UI.
- Trong UI tieng Viet, giu tone ngan gon, than thien, khong qua marketing.

## 8. Layout And Spacing

### Public/customer layout

Public va customer pages dung:

- Root: `min-h-screen bg-background text-white flex flex-col`.
- Header: sticky top, `z-40`.
- Main container: `max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8`.
- Section spacing:
  - Home main: `py-16 space-y-24`.
  - Listing/detail: `py-10` den `py-12`.
  - Booking wizard: `max-w-4xl`.

Khong su dung container qua hep cho home, restaurant listing va detail. Mau Figma co cam giac rong, visual can trai/phai co chu dich.

### Dashboard layout

Admin va owner dung app shell:

- Root: `flex h-screen overflow-hidden bg-background`.
- Sidebar desktop: static, `w-64`, `border-r`, `bg-sidebar`.
- Sidebar mobile: fixed overlay, slide in/out.
- Topbar: `h-16`, `bg-[#0F1115]/80`, backdrop blur.
- Main content: `overflow-y-auto p-4 md:p-8`.

Dashboard khong can hero lon. Uu tien mat do thong tin, filter ro, action gan noi dung.

### Grid patterns

Home featured restaurants:

- `grid grid-cols-1 md:grid-cols-3 gap-6`.
- Card image aspect: `aspect-[5/4]`.

Home tonight restaurants:

- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5`.
- Card image aspect: `aspect-[4/3]`.

Cuisine grid:

- `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4`.

Restaurant listing:

- Page layout: `grid grid-cols-1 lg:grid-cols-4 gap-8`.
- Filter: `lg:col-span-1`.
- Results: `lg:col-span-3`.
- Result card grid: `grid grid-cols-1 md:grid-cols-3 gap-6`.

Restaurant detail:

- Main layout: `grid grid-cols-1 lg:grid-cols-3 gap-8`.
- Content: `lg:col-span-2`.
- Booking panel: `lg:col-span-1`, sticky `top-24`.

Booking form:

- Wizard container: `max-w-4xl`.
- Time slots: `grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6`.
- Summary/details: responsive card blocks.

### Spacing scale

Prefer Tailwind spacing:

- Small control gap: `gap-2`, `gap-3`.
- Card internal padding: `p-4`, `p-5`, `p-6`.
- Section gap: `gap-6`, `gap-8`.
- Page vertical gap: `space-y-10`, `space-y-12`, home `space-y-24`.

Khong dung margin tuy tien de can pixel neu co the giai quyet bang container, grid hoac padding.

## 9. Header

`src/components/Header.jsx` la header public/customer chuan.

### Structure

- Wrapper: sticky top, `z-40`, dark translucent background, border bottom.
- Inner: `max-w-[1280px] mx-auto h-14 px-6 flex items-center justify-between`.
- Logo:
  - Icon container gradient primary to amber-600.
  - `Utensils` lucide icon.
  - Text `BookEat`, Playfair, white.
- Desktop nav:
  - Hidden on mobile, flex on md+.
  - `NavLink` active state: white text, `bg-[#20242D]`.
  - Inactive: muted text, hover white and secondary background.
- Auth area:
  - Logged out: `Dang nhap`, `Dang ky`.
  - Logged in: notification, avatar/menu, role workspace links.
- Mobile:
  - Menu button with lucide icon.
  - Dropdown panel under header.

### Header rules

- Header height giu `h-14` tren public.
- Khong lam header qua day, vi hero can bat dau gan top.
- Auth button can fit tren desktop; mobile chuyen vao menu.
- Logo la first-viewport brand signal, khong chi la nav text nho.

## 10. Buttons

Button primitive: `src/components/ui/button.jsx`.

### Variants

| Variant | Current classes intent | Usage |
| --- | --- | --- |
| `default` | primary background, dark foreground | Main CTA: tim kiem, dat ban, xac nhan |
| `destructive` | destructive bg/text | Cancel, delete, reject |
| `outline` | transparent/dark, border | Secondary action, detail, chat |
| `secondary` | secondary bg | Less prominent action |
| `ghost` | transparent hover accent | Nav, icon button, menu |
| `link` | text primary underline offset | Inline action only |

### Sizes

| Size | Intent |
| --- | --- |
| `sm` | compact table/card action |
| `default` | standard button |
| `lg` | hero/search/wizard CTA |
| `icon` | square icon button |

### Button rules

- Main action per card/page nen co mot primary CTA.
- Card secondary actions dung `outline` hoac `ghost`.
- Icon-only buttons phai co `aria-label`.
- Khong tao rounded pill text button khi co icon/control quen thuoc phu hop.
- Button label tieng Viet nen ngan: `Dat ban`, `Chi tiet`, `Chat`, `Huy`, `Luu`.

## 11. Cards And Panels

Card primitive: `src/components/ui/card.jsx`.

Default:

- `bg-card`
- `text-card-foreground`
- `rounded-xl`
- `border`
- `gap-6`

### Public card style

Restaurant/menu/voucher cards nen co:

- Border `border-border`, hover `border-primary/40`.
- Image top hoac left, aspect ratio co dinh.
- Noi dung co hierarchy: title, metadata, description, address/action.
- One primary or final action, not too many equal CTAs.
- Hover transition nhe: border, image scale, shadow neu can.

### Dashboard panel style

Dashboard cards nen:

- It decorative hon public cards.
- Co label, value, small trend/status.
- Dung `bg-card`, `border-border`, `p-4` den `p-6`.
- Khong long card trong card. Neu can group, dung section spacing hoac panel + table.

### Card rules

- Card radius khong vuot `rounded-xl`.
- Card khong nen co gradient nen manh tru khi la voucher/ticket/hero overlay.
- Anh trong card can co `object-cover`.
- Moi image container can co kich thuoc on dinh: `aspect-*`, `h-*`, `w-*`.

## 12. Forms

Form UI hien tai dung Tailwind class truc tiep va primitive input/select.

### Field anatomy

Search hero field:

- Field nam trong search card.
- Icon ben trai.
- Label uppercase `text-[11px] font-semibold text-muted-foreground`.
- Input/select transparent, white text, placeholder muted.

Dashboard/customer form field:

- Label tren input, `text-sm`.
- Input border `border-input`, background card/secondary.
- Focus ring primary.
- Error text destructive, dat ngay duoi field.

### Form rules

- Nhung field co gia tri object tu API can format truoc khi render.
  - Vi du: address co the la string hoac object.
- Select phai co default clear nhu `Tat ca phong cach` neu la filter.
- Primary submit dat o cuoi section/form.
- Disable submit khi loading hoac invalid.
- Loading state tren submit can giu width, khong lam nhay layout.

## 13. Tabs

Tabs tren restaurant detail hien tai:

- `TabsList`: `bg-[#20242D] border border-border p-1 rounded-lg h-11`.
- Trigger active: `bg-primary text-background`.
- Trigger inactive: muted/white hover.

Tabs hien tai gom:

- `Thuc don`
- `Ban`
- `Thong tin`

### Tab rules

- Tabs dung de doi noi dung cung cap bac, khong dung cho primary navigation lon.
- Label ngan, khong kem mo ta dai.
- Mobile phai fit ngang; neu qua 4 tabs, cho scroll horizontal.
- Active state phai ro bang background va text, khong chi bang border duoi.

## 14. Badges And Status

### PhaseLabel

`PhaseLabel` trong `src/components/bookeat/Section.jsx`:

- Amber text.
- Border primary alpha.
- Background primary alpha.
- Uppercase.
- Tracking duong.
- Dung cho editorial eyebrow nhu `Nghe thuat am thuc tu 2026`.

### Restaurant badges

- Featured/editor pick: primary/amber.
- Cuisine: secondary or outline.
- Price/rating: small metadata, amber icon.

### Booking status

`src/components/booking/StatusBadge.jsx` map:

- `pending`: amber.
- `confirmed`: emerald.
- `completed`: zinc.
- `cancelled`: rose.
- `no_show`: rose.

Status badge can:

- Co text ro.
- Co icon hoac semantic label.
- Dung `rounded-full`, `border`, `text-xs`.

## 15. Public Home Page

Source: `src/pages/HomePage.jsx`.

### Hero

Hero hien tai:

- Full-width visual background tu Unsplash.
- Overlay gradient dark de dam bao text doc duoc.
- Top padding: `pt-20 pb-28 md:pt-28 md:pb-40`.
- Container: `max-w-[1280px] px-6`.
- Content width: `max-w-4xl`.
- Eyebrow: `PhaseLabel`.
- H1: Playfair, `text-4xl sm:text-5xl md:text-6xl`.
- Emphasis word: italic primary.
- Paragraph: muted, max width.

Hero phai hien san pham ngay viewport dau: BookEat, dat ban nha hang, search controls.

### Search card

Search card:

- `mt-16`, `max-w-4xl`.
- `bg-card/95`, `border-border`, `backdrop-blur-md`, `shadow-2xl`.
- Form grid desktop: location, cuisine, guests, submit.
- Mobile: stack vertical.
- CTA: primary `Tim kiem ban`.

Search card khong nen chuyen thanh form nho le loi. No la main conversion control cua home.

### Quick suggestions

Quick suggestion row:

- Label muted: `Goi y tim nhanh:`.
- Pills/text actions: `Mon Viet`, `Hai san`, `Bit tet`, `Mon Phap`, `Thuan chay`.
- Pills nen wrap tren mobile.

### Featured section

Featured restaurants:

- Section title `Noi bat tuan nay`.
- Subtitle: editorial curation.
- Header co `Xem tat ca`.
- Grid 3 columns desktop.
- Card co image aspect `[5/4]`, badge editor pick, heart action, title/rating, price, description, address, CTA.

### Nearby/tonight section

- Title `Kham pha am thuc quanh ban`.
- Grid 4 columns desktop.
- Image aspect `[4/3]`.
- Card compact hon featured.

### Cuisine section

- Grid 6 columns desktop.
- Icon/image hoac subtle visual.
- Hover border/primary.

### Footer

- Darker footer `#090B0E`.
- Container `max-w-[1280px]`.
- Brand, short copy, navigation/support info.

## 16. Restaurant Listing Page

Source: `src/pages/RestaurantsPage.jsx`.

### Layout

- Page background: `bg-background`.
- Container: `max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10`.
- Header title: Playfair.
- Main grid: filter left, content right.

### Filter panel

Filter card:

- `p-5 bg-card border-border`.
- Keyword input.
- Cuisine list.
- Price range.
- Sort select.
- Buttons should be compact and scannable.

Filter must not push result cards too far down on desktop. Mobile can stack filter above results.

### Results

Results header:

- Count text.
- Active badge for selected cuisine/filter.
- Optional sort/clear action.

States:

- Loading: skeleton grid.
- Empty: centered dashed card with Compass icon and helpful text.
- Error: clear error panel/action.

Restaurant cards:

- Grid 3 columns desktop.
- Image aspect `[4/3]`.
- Title Playfair.
- Rating primary icon.
- Cuisine/price metadata.
- Address with MapPin.
- Actions: `Chi tiet`, `Chat`, `Dat ban`.

### Pagination

- Use compact buttons.
- Active page primary or strong border.
- Disabled buttons muted.

## 17. Restaurant Detail Page

Source: `src/pages/RestaurantDetailPage.jsx`.

### Banner

Banner:

- Height: `h-80 sm:h-[400px]`.
- Background image cover.
- Overlay: gradient from background to transparent/dark.
- Content bottom aligned in `max-w-[1280px]`.
- Breadcrumb row.
- Logo/avatar.
- H1 Playfair.
- Cuisine/featured badges.

If no cover image, use placeholder surface with icon, not blank black.

### Main content

Layout:

- Container: `max-w-[1280px]`.
- Grid: `lg:grid-cols-3`.
- Content: `lg:col-span-2`.
- Booking panel: sticky right.

Top info card:

- `p-5 bg-card border-border`.
- 3 columns on sm+.
- Address, hours/status, price/rating/contact.

Voucher strip:

- Show only when voucher exists.
- Cards/pills must not overpower booking CTA.

### Menu tab

- Filter/search row in card.
- Menu grid `sm:grid-cols-2`.
- Menu item card:
  - Image `h-20 w-20`.
  - Title, category/status, price primary.
  - Description truncated responsibly.

### Tables tab

- Info alert about table availability.
- Table grid `grid-cols-2 sm:grid-cols-3`.
- Status colors:
  - Available: emerald.
  - Occupied/unavailable: rose.
  - Reserved/pending: amber.

### Info tab

- Contact, description, address, hours.
- Current code co mot vai heading dung `border-l-2 border-primary pl-2`.
- New work nen han che side-stripe decoration. Neu can nhan manh section heading, uu tien icon, label badge, border full card hoac typography.

### Booking panel

- Sticky `top-24`.
- `p-6 bg-card border-border shadow-xl`.
- Primary booking CTA height `h-11`.
- Secondary chat button outline.
- Notes/warnings in muted panel.

Booking CTA phai luon de thay tren desktop. Tren mobile, panel di theo flow sau content hoac co sticky bottom neu sau nay can.

## 18. Booking Flow

Source: `src/pages/BookingFormPage.jsx`.

Booking flow la wizard 4 buoc:

1. Chon ngay, gio, so khach.
2. Chon ban.
3. Thong tin lien he va ghi chu.
4. Xac nhan, voucher, dat ban.

### Wizard structure

- Page container: `max-w-4xl`.
- Card: `p-6 bg-card border-border`.
- Step indicator:
  - Circle/number.
  - Active primary.
  - Completed distinguishable.
  - Inactive muted.

### Date/time/guests

- Date picker or date input must have clear label.
- Time slots grid: `grid-cols-2 sm:grid-cols-4 md:grid-cols-6`.
- Selected time: primary.
- Disabled time: muted with disabled cursor.
- Guest counter: stepper buttons, min/max enforced.

### Table selection

- Table cards show table number/name, capacity, area/status.
- Selected table has primary border/background.
- Unavailable table disabled and visibly muted.

### Contact and confirmation

- Contact fields validate before final submit.
- Voucher apply field must show applied/invalid state.
- Summary panel lists restaurant, date, time, guests, table, voucher/price if any.
- Success state centered, clear next action.

## 19. Booking, Waitlist And Voucher Cards

### BookingCard

Source: `src/components/booking/BookingCard.jsx`.

Structure:

- Card `p-4 bg-card border-border`.
- Responsive: stack on mobile, row on sm+.
- Thumbnail: full width mobile, `sm:w-32 sm:h-24`.
- Metadata grid: `grid-cols-2 md:grid-cols-4`.
- Actions grouped right/bottom.
- Status badge visible near title or top-right.

### WaitlistCard

Source: `src/components/waitlist/WaitlistCard.jsx`.

Structure:

- `p-5 bg-card border-border hover:border-primary/20`.
- Header with title/status.
- Metadata grid 3 columns.
- Secondary info panel.
- Pending estimate panel with primary/amber tone.
- Actions: detail, cancel, join/leave depending state.

### VoucherCard

Source: `src/components/voucher/VoucherCard.jsx`.

Style:

- Ticket-like card.
- `bg-[#1A1D24]`, border `#2C313C`, `rounded-xl`.
- Cutout circles and dashed separator.
- Saved state: `border-primary/40 bg-primary/5`.
- Saved action can use emerald/success state.

Voucher card can be more decorative than dashboard cards, but still must keep text scannable.

## 20. Admin And Owner Shells

Sources:

- `src/components/admin/AdminLayout.jsx`
- `src/components/owner/OwnerLayout.jsx`

### Shared shell

- Root: `flex h-screen overflow-hidden bg-background`.
- Sidebar:
  - Desktop: `w-64`, visible.
  - Mobile: fixed overlay, transform slide.
  - Background: `bg-sidebar`.
  - Border: `border-border`.
- Main area:
  - Topbar height `h-16`.
  - Content scrolls independently.
  - Padding `p-4 md:p-8`.

### Sidebar brand

Owner:

- Logo: Utensils icon, primary gradient.
- Text: `BookEat`, Playfair.
- Subtitle: workspace/restaurant context.
- RestaurantSwitcher below brand when relevant.

Admin:

- Logo: Shield icon.
- Text: `BookEat`.
- Subtitle: admin context.

### Nav item

Active:

- `bg-primary/10 text-primary`.
- Icon primary.

Inactive:

- Muted foreground.
- Hover `bg-secondary/40 text-white`.

Nav item:

- `px-3 py-2.5 rounded-lg text-sm`.
- Icon left.
- Label one line when possible.

### Topbar

- Mobile menu button.
- Search field desktop, width about `w-64`.
- Notification icon with small primary dot.
- Optional action slot.
- Avatar/user menu area.

### Dashboard design rules

- Dashboard pages are operational, not editorial.
- Avoid huge hero blocks.
- Use metrics, filters, tables, list cards, charts.
- Primary CTA in topbar or section header.
- Empty state includes one recommended action.

## 21. Tables, Lists And Data Views

Admin/owner pages should use these patterns:

### Table

- Surface: card/panel with border.
- Header row muted background or subtle border.
- Text size: `text-sm`.
- Row hover: secondary/accent alpha.
- Important status as badge.
- Actions right aligned, icon button or compact button.

### Filters

- Put filters above table/list in same section.
- Search first, then status/date/category.
- Keep filters wrap-friendly on mobile.
- Clear filter action only when active filters exist.

### Empty states

Must include:

- Icon.
- Short title.
- One sentence explaining state.
- One action if useful.

Empty state should be calm, not oversized.

### Loading states

- For page-level initial load: spinner or skeleton.
- For table/list: skeleton rows/cards.
- For button action: loading state inside button.

## 22. Imagery

BookEat should rely on real dining visuals.

### Current image usage

- Home hero uses Unsplash dining image.
- Restaurant cards use restaurant image or placeholder.
- Detail banner uses cover image.
- Menu item uses item image or placeholder.

### Image rules

- Always set object fit: `object-cover`.
- Always set stable size: `aspect-*`, `h-*`, `w-*`.
- Do not use dark blurred stock visuals when the user needs to inspect food/restaurant.
- Placeholder can use:
  - Dark secondary background.
  - Utensils/Image icon.
  - Subtle primary accent.
- Images must not resize card height after load.

## 23. Motion And Interaction

Motion should be subtle.

Recommended:

- `transition-colors`, `transition-all`, `duration-200`.
- Image hover scale: `group-hover:scale-105`.
- Border hover primary alpha.
- Dropdown/menu slide/fade from Radix where available.

Avoid:

- Layout-shifting animation.
- Infinite decorative animation.
- Overly bouncy dashboard transitions.
- Heavy blur on large surfaces except header/search overlay where already used.

Focus/keyboard:

- All interactive elements must have visible focus ring.
- Ring color primary via token `--color-ring`.
- Icon-only controls need `aria-label`.

## 24. Responsive Behavior

### Breakpoints

Use Tailwind defaults:

- `sm`: phone landscape/small tablet.
- `md`: tablet.
- `lg`: desktop.
- `xl` and above: wide desktop.

### Public pages

- Header nav hidden below `md`, mobile menu enabled.
- Hero h1 scales down cleanly.
- Search card stacks on mobile.
- Restaurant grids:
  - 1 column mobile.
  - 2 columns where appropriate on `sm`.
  - 3 or 4 columns desktop depending section.
- Detail page:
  - Banner height lower on mobile.
  - Booking panel follows content on mobile.

### Dashboard

- Sidebar fixed overlay on mobile.
- Desktop sidebar always visible.
- Topbar search hidden or compressed on mobile.
- Tables may need horizontal scroll or card conversion.
- Action bars wrap, primary action remains visible.

### Text fitting

- Long restaurant names can wrap to 2 lines in cards.
- Addresses can be truncated with tooltip only when necessary.
- Buttons should not shrink label to unreadable size.
- Do not scale font by viewport width.

## 25. Accessibility

Accessibility requirements:

- Use semantic buttons and links.
- Icon-only buttons require `aria-label`.
- Form inputs require associated label or accessible label.
- Error messages should be close to field.
- Color-only status is not enough, include text.
- Focus visible state must not be removed.
- Contrast on dark background must remain readable.
- Images that are decorative can have empty alt; restaurant/menu images should have meaningful alt.

Keyboard flows:

- Header menu opens/closes with keyboard.
- Dialogs trap focus via Radix.
- Tabs are keyboard navigable via Radix.
- Booking wizard can be completed without mouse.

## 26. Data Robustness Rules

API data can be incomplete or shaped inconsistently. UI must guard against:

- Missing image.
- Missing rating.
- Empty restaurant list.
- Empty menu list.
- Empty table list.
- Address as string or object.
- Price range as missing/null.
- User not logged in.
- Restaurant owner without restaurant yet.
- Network/loading/error states.

Examples:

- Restaurant detail uses address formatter to avoid `[object Object]` or blank route.
- Listing and home use placeholder image when `image` is missing.
- Empty list states should still look designed, not like broken whitespace.

## 27. Page-Specific Checklist

### New public/customer page

Before shipping:

- Uses `Header`.
- Uses `bg-background text-white`.
- Main container is `max-w-[1280px]` unless the flow is intentionally narrow.
- Page title has proper hierarchy.
- Has loading, empty and error states when data-driven.
- Primary action is visible.
- Mobile layout checked.

### New dashboard page

Before shipping:

- Lives inside AdminLayout or OwnerLayout.
- Starts with compact page header/action row.
- Uses card/panel/table patterns.
- Filters are close to data.
- Empty state has one useful action.
- Destructive actions require confirm.

### New component

Before shipping:

- Uses existing tokens.
- Uses `Button`, `Card`, `Badge`, `Input`, `Dialog`, `Tabs` primitives when possible.
- Does not add unlayered global CSS.
- Has stable dimensions for image/icon/control areas.
- Icon-only controls have `aria-label`.

## 28. Do And Do Not

### Do

- Use `max-w-[1280px]` for public/customer wide pages.
- Use Playfair for brand and editorial headings.
- Use Inter for all UI controls.
- Use lucide-react icons.
- Use primary amber for the main action and highlight.
- Use stable image aspect ratios.
- Use `@layer base` for reset.
- Use skeleton/empty/error states for data-driven sections.

### Do not

- Do not reintroduce unlayered global reset.
- Do not use `max-w-7xl` on public/customer pages that should match current FE width.
- Do not use negative letter spacing.
- Do not create nested cards for page sections.
- Do not make beige, brown, purple or single-hue theme variants.
- Do not create marketing-only hero when the page should be usable.
- Do not rely on color alone for status.
- Do not hand-draw icons when lucide has a suitable icon.

## 29. Quality Gates

Run these checks after meaningful UI changes:

1. Build:

```bash
npm run build
```

2. Browser verification:

- Open `http://localhost:5173/`.
- Check home desktop and mobile.
- Check `/restaurants`.
- Check at least one restaurant detail route.
- Check booking flow start.
- Check one admin or owner dashboard route if shell changed.

3. Visual QA:

- No giant blank right side on desktop.
- No text overlap.
- No card width collapse.
- Header active/hover states visible.
- Buttons keep primary background.
- Images render and crop intentionally.
- Empty/loading states look designed.

4. Cascade QA:

- Tailwind utilities like `mx-auto`, `px-*`, `bg-primary`, `border-border` work.
- If utilities stop applying, inspect `src/index.css` first.

## 30. Migration Notes From Previous Design Doc

Old design notes referenced a more generic `Complete Restaurant Booking UI` template. Current FE has moved closer to an actual routed product. These are the important changes:

- Theme tokens now live in `src/index.css`, not a separate theme-only CSS file.
- Tailwind 4 cascade layer behavior matters, especially for global resets.
- Public layout now uses explicit `max-w-[1280px]`.
- Typography is Inter plus Playfair, with no negative letter spacing.
- Header is sticky, compact and role-aware.
- Admin and owner shells are real app shells with sidebar/topbar, not marketing sections.
- Detail page supports menu, tables, info and sticky booking panel.
- Booking flow is a multi-step wizard.
- Cards, voucher, waitlist and booking components have current custom patterns.

## 31. File Ownership Guidelines

Use this map when deciding where to edit:

| Need | Edit |
| --- | --- |
| Token color/font/radius/global reset | `src/index.css` |
| Button visual behavior | `src/components/ui/button.jsx` |
| Card primitive behavior | `src/components/ui/card.jsx` |
| Public header/nav/auth display | `src/components/Header.jsx` |
| Shared section heading/eyebrow | `src/components/bookeat/Section.jsx` |
| Home visual composition | `src/pages/HomePage.jsx` |
| Restaurant listing/filter/card layout | `src/pages/RestaurantsPage.jsx` |
| Restaurant detail/banner/tabs/booking panel | `src/pages/RestaurantDetailPage.jsx` |
| Booking wizard | `src/pages/BookingFormPage.jsx` |
| Customer booking card | `src/components/booking/BookingCard.jsx` |
| Booking status badge | `src/components/booking/StatusBadge.jsx` |
| Voucher ticket card | `src/components/voucher/VoucherCard.jsx` |
| Waitlist card | `src/components/waitlist/WaitlistCard.jsx` |
| Owner app shell | `src/components/owner/OwnerLayout.jsx` |
| Admin app shell | `src/components/admin/AdminLayout.jsx` |

## 32. Current Visual Summary

BookEat FE hien tai can duoc cam nhan nhu mot ung dung dat ban nha hang cao cap:

- Public side: editorial, visual, warm, premium, toi gian nhung khong trong rong.
- Customer flows: ro rang, tin cay, it friction.
- Owner/admin side: van cung tone mau, nhung uu tien tac vu, bang du lieu va trang thai.
- Tat ca surface deu nam tren dark foundation voi amber highlight, Playfair chi tao diem nhan, Inter giu tinh dung duoc.

Moi thay doi UI moi nen hoi: no co lam nguoi dung tim nha hang, dat ban, quan ly booking hoac van hanh nha hang nhanh hon va ro rang hon khong. Neu co, tiep tuc. Neu chi la trang tri, can rat tiet che.
