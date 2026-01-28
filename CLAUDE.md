# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 app (App Router) with React 19 and Tailwind CSS 4. A wedding seating planner for Matt & Rachel's wedding on 11 April.

### Key Files

- `app/page.tsx` - Main app: drag-and-drop seating planner with guest list, tables, and floor plan layout

### Data Model

State is stored server-side in Vercel Blob. The client loads and saves via `/api/seating`.
- `tables` - Array of table objects with guest assignments
- `unassigned` - Array of guest IDs not yet seated
- `removed` - Array of guest IDs that have been removed (can be restored)
- `customGuests` - Array of guests added by user (not in original list)

### Floor Plan Layout

- **Bridal Table**: Fixed with Matt & Rachel (bride/groom), capacity 2, cannot add others
- **Tables 1-8**: 10 guests each, arranged in 2 columns (1-4 left, 5-8 right)
- Stage/dance floor shown at top

### Features

- Drag guests from unassigned list to tables
- Drag guests between tables
- Drag guests back to unassigned list
- Clear table button (X) on each table
- Add new guests via input field
- Remove guests (moves to "Removed" section)
- Restore removed guests
- All lists sorted by: Lastname, Firstname
- Display format: "Lastname, Firstname"
- server-side persistence via Vercel Blob

### Guest List

73 original guests hardcoded in `ALL_GUESTS` array. Users can add custom guests which get IDs prefixed with `custom-`.

## Environment

Required on Vercel:
- `BLOB_READ_WRITE_TOKEN`
- `APP_PASSWORD` (defaults to `wedding2025` if not set)

## Deployment

- GitHub: `https://github.com/matthendrix/table-picker`
- Vercel: `https://table-picker-ashen.vercel.app/`
- Push to master triggers auto-deploy
