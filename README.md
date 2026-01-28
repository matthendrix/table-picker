# Table Picker

Wedding seating planner with drag-and-drop seating, built on Next.js App Router.

## Quick start

```bash
npm install
npm run dev
```

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Vercel Blob for persistence

## How it works

- The UI is client-side and uses drag-and-drop for seating changes.
- Changes are saved via `/api/seating` after a 1s debounce.
- The server writes each save to a versioned blob and reads the newest one on load.

## Auth model

- A simple shared password is required to load/save data.
- The password is sent in the `x-app-password` header.

## Data model

```ts
type SeatingState = {
  tables: { id: string; name: string; capacity: number; guests: string[] }[];
  unassigned: string[];
  removed: string[];
  customGuests: { id: string; firstName: string; lastName: string }[];
};
```

## Bridal party

- Bridal guests are defined in `BRIDAL_PARTY` and are not draggable.
- They are intentionally not part of `ALL_GUESTS` to avoid double-seating.

## Persistence design

- Each save writes a new blob named `seating-data-<timestamp>.json`.
- The newest blob by `uploadedAt` is read for loading.
- Old blobs are pruned after each save (keeps the latest 20).

## Environment variables (Vercel)

```text
BLOB_READ_WRITE_TOKEN
APP_PASSWORD
```

## Deployment

- GitHub: `https://github.com/matthendrix/table-picker`
- Vercel: `https://table-picker-ashen.vercel.app/`

## Operational notes

- If saves fail, check that `APP_PASSWORD` matches the password you enter.
- If loads fail, check `BLOB_READ_WRITE_TOKEN` and function logs.
