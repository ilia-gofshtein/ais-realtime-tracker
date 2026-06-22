# AIS Tracker Realtime

Real-time AIS vessel tracking application built with React, TypeScript, MobX, MapLibre GL, and a Node.js WebSocket proxy.

The app connects to AISStream through a local backend proxy, receives live AIS vessel position reports, normalizes them on the server, and displays vessels on an interactive map.

<img width="1507" height="819" alt="image" src="https://github.com/user-attachments/assets/73250761-7717-4161-8e12-e7ece1766d03" />

## Overview

AIS Tracker Realtime is a web application for displaying live AIS vessel data on a map.

AIS stands for Automatic Identification System. Ships use AIS to broadcast information such as vessel position, speed, course, heading, MMSI, and related metadata.

The current version of the app can:

- subscribe to AIS data for that area
- receive live vessel position reports
- display vessels on a MapLibre GL map
- show available vessels in an overlay list
- show vessel details in a map popup

The app uses Amsterdam as the default area because AISStream coverage is known to work reliably there. AIS availability depends on receiver coverage, so some regions may return no data even if vessels are physically present.

## Project Goals

The goal of this project is to build a clean and extendable real-time AIS tracking application while keeping the first version simple.

Main goals:

- keep API keys server-side
- avoid exposing secrets in the browser
- use shared TypeScript contracts between backend and frontend
- separate transport logic from state management
- keep map lifecycle isolated from UI components
- use a modular monolith architecture
- make the project safe for a public GitHub repository

Possible future features:

- selected vessel details panel
- vessel search
- vessel filtering
- heading vectors
- vessel trails
- historical replay
- route tracking
- port traffic monitoring
- geofencing zones
- simple anomaly detection
- persistent storage with PostgreSQL/PostGIS
- Docker setup

## Architecture

The project follows a modular monolith approach.

It is intentionally not split into microservices at this stage. For a pet project, a modular monolith gives a good balance between simplicity, maintainability, and future scalability.

High-level data flow:

```txt
AISStream
   ↓
Node.js backend proxy
   ↓
AIS normalization
   ↓
In-memory vessel state
   ↓
Realtime WebSocket updates
   ↓
React frontend
   ↓
MapLibre GL map
```

The backend is responsible for AISStream communication, API key protection, message normalization, bounding box validation, and realtime updates.

The frontend is responsible for map rendering, UI overlays, vessel visualization, and client-side state.

## Data Flow

When the app starts:

```txt
1. User opens app
2. Frontend sends the bounding box to the backend
3. Backend validates the bounding box
4. Backend connects to AISStream
5. Backend subscribes to AIS data for the bounding box
6. AISStream sends raw AIS position reports
7. Backend normalizes raw messages into vessel objects
8. Backend stores the latest vessel state in memory
9. Backend sends vessel updates to the frontend
10. Frontend updates MobX state
11. MapLibre GL renders vessels on the map
```

The app uses a `snapshot + live updates` model.

When a client subscribes to a bounding box, the backend can immediately send a cached vessel snapshot for that area if data is already available. After that, live AIS updates continue to update the map in real time.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- MobX
- MapLibre GL JS

### Backend

- Node.js
- TypeScript
- ws
- dotenv

### Development

- ESLint
- GitHub Actions CI
- Node.js 24

### External Data Source

- AISStream WebSocket API

## Security

This repository is intended to be public.

The AISStream API key must never be exposed to the frontend and must never be committed to the repository.

Correct:

```env
AISSTREAM_API_KEY=your_aisstream_api_key_here
```

Incorrect:

```env
VITE_AISSTREAM_API_KEY=your_real_key_here
```

Any environment variable prefixed with `VITE_` can be exposed to the browser bundle.

The frontend should only know the backend WebSocket URL. It should never connect directly to AISStream.

Correct flow:

```txt
React frontend
   ↓
Local backend WebSocket proxy
   ↓
AISStream
```

Before publishing or pushing changes, make sure no real API key exists in:

- source code
- README
- screenshots
- logs
- commit history
- `.env.example`

## Environment Variables

Create a local `.env` file in the project root:

```env
AISSTREAM_API_KEY=your_aisstream_api_key_here
PORT=3001
LOG_LEVEL=info
VITE_REALTIME_WS_URL=ws://localhost:3001/ws
```

Create and commit `.env.example` with placeholder values only:

```env
AISSTREAM_API_KEY=your_aisstream_api_key_here
PORT=3001
LOG_LEVEL=info
VITE_REALTIME_WS_URL=ws://localhost:3001/ws
```

Make sure `.env` is ignored by Git:

```gitignore
.env
.env.local
.env.*.local
```

`VITE_REALTIME_WS_URL` is safe because it contains only the frontend-to-backend WebSocket URL, not a secret.

## Installation

Use Node.js 24.

If you use `nvm`:

```bash
nvm use
```

Install dependencies:

```bash
npm install
```

## Running Locally

Start both the backend proxy and the Vite frontend:

```bash
npm run dev
```

Expected local URLs:

```txt
Frontend:
http://localhost:5173

Backend WebSocket proxy:
ws://localhost:3001/ws
```

## Available Scripts

```bash
npm run dev
```

Start frontend and backend in development mode.

```bash
npm run dev:client
```

Start only the Vite frontend.

```bash
npm run dev:server
```

Start only the Node.js backend.

```bash
npm run typecheck
```

Run TypeScript type checking.

```bash
npm run lint
```

Run ESLint.

```bash
npm run build
```

Build the frontend for production.

```bash
npm run preview
```

Preview the production build locally.

## AIS Bounding Boxes

AISStream subscriptions are based on bounding boxes.

Bounding box format:

```ts
;[
    [southLat, westLon],
    [northLat, eastLon],
]
```

MapLibre and GeoJSON use a different coordinate order:

```txt
[longitude, latitude]
```

This difference is important:

- AISStream bounding box: latitude first
- GeoJSON coordinates: longitude first

## Current Limitations

This is still an early prototype.

Current limitations:

- vessel data is stored only in memory
- no persistent historical storage yet
- no route replay
- no vessel search
- no advanced filtering
- no authentication
- no production deployment setup
- AIS data completeness depends on AISStream coverage and availability
- after a cold backend start, vessels appear gradually as AIS messages arrive

## Roadmap

Planned improvements:

- add selected vessel state
- click vessel in list to focus map
- add vessel search
- add filters by vessel name, MMSI, speed, and area
- add vessel trails
- add heading vectors
- add map bounding box resubscription with debounce
- expire stale vessel positions
- add persistent storage
- add route replay mode
- add Docker setup
- add unit tests for AIS normalization
- add unit tests for bounding box validation
- add unit tests for vessel repository logic
- add CI checks for tests
- add screenshots or demo GIF

## Public Repository Checklist

Before pushing the repository publicly:

- [ ] `.env` is listed in `.gitignore`
- [ ] `.env.example` exists and contains only placeholder values
- [ ] no real API keys are present in source code
- [ ] no real API keys are present in README
- [ ] no real API keys are present in screenshots
- [ ] no real API keys are present in logs
- [ ] `git status` does not include `.env`
- [ ] project starts with `npm run dev`
- [ ] frontend does not connect directly to AISStream
- [ ] backend reads AISStream key from server-side environment variables only

Useful checks:

```bash
git grep -n "AISSTREAM_API_KEY"
git grep -n "VITE_AIS"
git grep -n "APIKey"
git grep -n "apiKey"
```

## License

This project is currently intended as a personal pet project.

A license can be added depending on how the repository will be used.
