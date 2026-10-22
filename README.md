# Ultimate GSM

Phone repair site for Ultimate GSM. Tagline: **We Fix It. You Love It.** Slogan: **Phone Repair Specialist.**

The app is Next.js (App Router) with PostgreSQL via Drizzle. Bookings, contact notes, and repair status live in the database. The public tracker reads that same data.

## Connect the real shop details

Edit `src/lib/site.ts`.

| Token | Field | What to put |
| --- | --- | --- |
| `[PHONE NUMBER]` | `phone` | Shop phone, shown in the footer, contact page, and booking copy |
| `[WHATSAPP LINK]` | `whatsappLink` | Full link, for example `https://wa.me/2348012345678` |
| (digits) | `whatsappNumber` | Country code + number, digits only. Used if `whatsappLink` is still a placeholder |
| `[EMAIL]` | `email` | Shop email |
| `[ADDRESS]` | `address` | Drop-off address. The contact map stays a placeholder until this is real |
| `[HOURS]` | `hours` | Published hours text |
| `[FORM ENDPOINT]` | `formEndpoint` | Leave as the token to post bookings to `/api/bookings`. Set a full `https://` URL to send the same JSON elsewhere |
| `[FORM ENDPOINT]` | `inquiryEndpoint` | Same idea for the contact form. Default is `/api/inquiries` |

The open/closed badge and the booking calendar use `placeholderSchedule` in the same file (Mon–Sat 09:00–18:00, Sunday closed) until you replace it with real hours. The badge still prints `[HOURS]` in its detail text so the stand-in schedule is obvious.

WhatsApp buttons open a pre-filled message. If the link and number are still placeholders, the button uses `https://api.whatsapp.com/send?text=...` so the message is ready and the visitor chooses the chat. After you set `whatsappLink` or `whatsappNumber`, messages go straight to the shop.

## Live repair status

- Table: `repair_requests` and `status_events` in `src/db/schema.ts`
- Public read: `GET /api/track?ref=UGSM-1001`
- Create: `POST /api/bookings` (the wizard)
- Staff updates: `/desk` (demo key `bench`, or `DESK_KEY` in the environment) calls `PATCH /api/desk`

Sample references `UGSM-1001` through `UGSM-1004` are placeholder rows seeded on first use so the timeline can be tried. They are flagged `is_sample`. Real wizard bookings are stored the same way and show on the tracker.

Apply the schema with:

```bash
npx drizzle-kit push
```

Slot capacity is `SLOT_CAPACITY` in `src/lib/site.ts` (placeholder setting, default 3 per slot).

## Media

- Technician portrait: `public/images/technician.jpg` (home hero and About)
- Site background: `public/videos/hero-background.mp4`, shown fixed behind every page by `src/components/SiteBackground.tsx`, with poster `public/images/hero-background-poster.jpg` (used for reduced-motion visitors)
- Exploded plate used to build that loop: `public/images/exploded-phone.jpg`. Re-encode it with `python3 scripts/build_explosion.py` (requires `imageio-ffmpeg` and `pillow`)
- Store product images: `public/images/store/` (downloaded from the supplied official Oraimo Ghana catalog routes)
- Supporting accessory imagery: `public/images/accessories/`

The `/store` page is a curated catalog. Its product buttons open the official Oraimo Ghana product pages, and its campaign button uses the supplied daily-deals URL in `src/lib/site.ts`. Price and stock are deliberately not copied because those values can change; visitors see the live values at Oraimo checkout.

Replace the local technician photo and product video while keeping the same names. The hero video is muted, looping, and loaded after first paint. It does not autoplay when the visitor prefers reduced motion.

## Wizard draft

Unfinished bookings are saved in `localStorage` under `ugsm-repair-draft`. A finished confirmation is kept in `sessionStorage` so a refresh on the confirmation screen still shows the reference.
