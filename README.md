### Toronto's Bike Network and Traffic Visualized

## App Layout
toronto-bike-traffic
|--api/   <- flask API (backend)
|--app/   <- Next.js app (frontend)

## Running The App Locally
1. Start Flask server from root: `python -m api.app_local`
2. Start Next.js dev server:
   1. `cd app`
   2. `npm run dev`
   - Note: the dev server runs effects twice to check for side effects. The local prod server can be run with:
     - `npm run build` -> `npm run start`