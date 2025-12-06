### Toronto's Bike Network and Traffic Visualized

## Links
Next.js App: https://toronto-bike-traffic.vercel.app

Flask API: https://toronto-bike-traffic-backend.vercel.app/api/v1/hi

## Data Sources
City of Toronto Open Data API: 
- https://open.toronto.ca/dataset/permanent-bicycle-counters/
- https://open.toronto.ca/dataset/cycling-network/

## App Layout
toronto-bike-traffic \
|-- api/   <- flask API (backend) \
|-- next-app/   <- Next.js app (frontend) 

## Running The App Locally
1. Start Flask dev server: 
   1. `cd api`
   2. `.venv\Scripts\activate`
   3. `python -m app_local`
2. Start Next.js dev server:
   1. `cd app`
   2. `npm run dev`
   - Note: the dev server runs effects twice to check for side effects. The local prod server can be run with:
     - `npm run build` -> `npm run start`