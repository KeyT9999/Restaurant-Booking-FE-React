---
name: BookEat
register: product
description: Product context and decision guide for the BookEat restaurant booking app
lastUpdated: 2026-06-17
related:
  designSystem: design.md
  frontend: src
  backend: ../BookEat_BE_NodsJS
---

# BookEat Product Context

BookEat is a restaurant booking product for customers, restaurant owners, and platform admins. The product should feel trustworthy, premium, and ready for real use, but the core value is practical: help people find restaurants, reserve tables, and help restaurants operate bookings with less friction.

Use this file for product decisions. Use `design.md` for visual system, component rules, layout, typography, and implementation-specific UI guidance.

## Product Purpose

BookEat connects diners with restaurants and gives restaurant teams a working operations surface for reservations, tables, menus, vouchers, waitlists, chat, payments, refunds, and reporting.

The product is not a marketing-only restaurant showcase. Public pages may feel editorial and premium, but every major surface should move the user closer to a real task: find a place, book a table, manage a booking, answer a customer, or operate a restaurant.

## Primary Users

### Customer

Customers use BookEat to discover restaurants, compare details, reserve a table, manage bookings, join waitlists, save vouchers, and chat with restaurants or support.

They need:

- Fast discovery by cuisine, location, price, and availability.
- Clear restaurant detail pages with images, address, menu, table information, policies, and booking notes.
- A booking flow that feels predictable and safe.
- Booking history, status updates, cancellation paths, and waitlist visibility.
- Voucher discovery and saved voucher management.
- Chat access when booking details are uncertain.

### Restaurant Owner

Restaurant owners use BookEat to set up restaurant profiles and operate daily service.

They need:

- Restaurant profile management, including address, operating hours, images, policies, and booking notes.
- Menu and table management that is easy to update before service.
- Booking review, confirmation, cancellation, table reassignment, and completion workflows.
- Waitlist handling and conversion to bookings.
- Voucher and promotion management.
- Billing, revenue, refund, and operational visibility.
- Customer chat connected to booking context.

### Admin

Admins use BookEat to keep the marketplace healthy, approve restaurants, monitor activity, and resolve issues.

They need:

- User, restaurant, booking, waitlist, voucher, refund, and revenue management.
- Approval and moderation workflows that are compact and auditable.
- Status history and clear action feedback.
- Dashboards that surface exceptions, not decorative metrics.

## Core Product Journeys

1. Customer finds a restaurant, checks detail, selects date and time, chooses or accepts a table, enters contact details, applies voucher if available, and submits a booking.
2. Restaurant owner receives a booking, checks capacity and table fit, confirms or adjusts the booking, and updates status during service.
3. Customer cannot get a matching table, joins waitlist, then receives status updates or conversion to booking.
4. Owner creates and maintains restaurant, menu, table layout, vouchers, and booking policies.
5. Admin approves restaurants, monitors platform data, handles user or restaurant issues, and reviews payments or refunds.

## Product Principles

### Make Booking Feel Certain

The booking flow should always show what has been selected: restaurant, date, time, guests, table, contact info, voucher, and expected deposit. If a step is blocked, explain the exact missing or invalid input near the control.

### Prefer Task Clarity Over Decoration

Premium visuals are welcome on public/customer pages, but task completion wins. Owner and admin screens should be dense, calm, and scannable. Avoid hero-like dashboard sections unless they directly support a workflow.

### Respect Real Restaurant Operations

Restaurants operate under time pressure. Owner workflows should put actions close to the relevant booking, table, waitlist, voucher, or menu item. Bulk status, filters, search, and compact rows matter more than large decorative panels.

### Build Trust With State

Every important object should expose status clearly: pending, confirmed, completed, cancelled, no-show, available, occupied, closed, expired, used, refunded. Status must be text-based and not color-only.

### Keep Data Robust

API data can be incomplete. Missing images, empty menus, missing ratings, object-shaped addresses, unavailable tables, unauthenticated users, and network errors should have designed states instead of broken UI.

### Do Not Hide the Next Action

Each page should make the natural next action obvious:

- Restaurant detail: book, chat, view menu, or review table availability.
- Booking flow: continue to table check, contact details, or confirmation.
- Customer account: view booking, cancel where allowed, join waitlist, manage voucher.
- Owner dashboard: handle pending bookings, update table/menu, review waitlist.
- Admin dashboard: review approvals, exceptions, refunds, and platform health.

## Product Tone

BookEat should sound clear, helpful, and confident. Vietnamese UI copy should be short and direct. Avoid over-marketing inside transactional flows.

Good tone:

- "Chọn ngày dùng bữa"
- "Kiểm tra bàn trống"
- "Khung giờ này đã hết bàn phù hợp"
- "Nhà hàng sẽ xác nhận yêu cầu của bạn"

Avoid:

- Long feature explanations inside the UI.
- Copy that talks about the interface itself.
- Equal-weight CTAs that make the next step unclear.
- Decorative copy on owner and admin pages.

## Product Register

BookEat is a `product` register interface. Design serves the task.

Public pages can use richer imagery and editorial hierarchy because dining discovery is emotional and visual. Customer, owner, and admin workflows should use familiar product UI patterns: clear navigation, standard forms, tables, filters, tabs, badges, dialogs only when necessary, and visible feedback after actions.

## Non-Goals

BookEat should not become:

- A landing-page-only restaurant brand site.
- A decorative portfolio of restaurant images without real booking utility.
- A dashboard full of generic metric cards that do not drive action.
- A social feed or review-first product unless that becomes an explicit future requirement.
- A design experiment that invents unfamiliar controls for common booking tasks.

## Decision Rules

When adding or changing a feature, prefer the option that:

1. Reduces booking friction for customers.
2. Makes restaurant operations faster or less error-prone.
3. Gives admins clearer visibility into exceptions and risk.
4. Preserves visual consistency with `design.md`.
5. Handles incomplete API data without breaking the interface.
6. Keeps the primary action visible and unambiguous.

When in doubt, choose the simpler product workflow and keep visual polish in service of clarity.

## Relationship To `design.md`

`PRODUCT.md` defines product intent, users, priorities, tone, and decision rules.

`design.md` defines visual language, tokens, components, page patterns, layout rules, quality gates, and implementation ownership.

If the two files conflict, prefer this file for product behavior and priorities, then adapt the UI through `design.md` without violating the existing design system.
