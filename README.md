# AIS Tracker Realtime

Real-time AIS vessel tracking application built with React, TypeScript, MobX, MapLibre GL, and a Node.js WebSocket proxy.

The app connects to AISStream through a local backend proxy, receives live AIS vessel position reports, normalizes them on the server, and displays vessels on an interactive map.

The project is built as a public pet project, but follows a clean modular architecture with separated transport, state, map lifecycle, and shared contracts.

<img width="1507" height="819" alt="image" src="https://github.com/user-attachments/assets/73250761-7717-4161-8e12-e7ece1766d03" />


## Table of Contents

- [Overview](#overview)
- [Project Goals](#project-goals)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [State Management](#state-management)
- [Map Architecture](#map-architecture)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Geolocation Flow](#geolocation-flow)
- [AIS Bounding Boxes](#ais-bounding-boxes)
- [Current Limitations](#current-limitations)
- [Roadmap](#roadmap)
- [Public Repository Checklist](#public-repository-checklist)
- [License](#license)

## Overview

AIS Tracker Realtime is a web application for displaying live AIS vessel data on an interactive map.

AIS stands for Automatic Identification System. Ships use AIS to broadcast information such as vessel position, speed, course, heading, MMSI, and related metadata.

The current version of the app:

- requests the user’s current location
- centers the map on the user
- calculates the current map bounding box
- sends the bounding box to the backend
- subscribes to AISStream using that bounding box
- receives live vessel position reports
- displays vessels on a MapLibre GL map
- shows available vessels in an overlay list

## Project Goals

The goal of this project is to build a clean and extendable real-time AIS tracking application.

Main goals:

- keep API keys server-side
- avoid exposing secrets in the browser
- use shared TypeScript contracts between backend and frontend
- keep transport logic separate from MobX stores
- keep map lifecycle isolated in dedicated hooks
- use a modular monolith architecture
- make the project safe for a public GitHub repository
- keep the first version simple while preparing for future features

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
- PostgreSQL/PostGIS storage
- Docker setup

## Architecture

The project follows a modular monolith approach.

It is intentionally not split into microservices at this stage. For a pet project, a modular monolith gives a better balance between simplicity, maintainability, and future scalability.

```txt
AISStream
   ↓
Node.js backend proxy
   ↓
AIS normalization
   ↓
Vessel domain service
   ↓
Realtime WebSocket server
   ↓
React frontend
   ↓
MapLibre GL map
```

### Why Modular Monolith?

Microservices would add unnecessary complexity at this stage:

- multiple deployable services
- more infrastructure
- duplicated configuration
- network boundaries
- more operational overhead

A modular monolith keeps the project simple while still separating responsibilities clearly.

## Data Flow

Current data flow:

```txt
1. User opens the app
2. Frontend requests browser geolocation
3. Map centers on the user location
4. Frontend calculates the current map bounding box
5. Frontend sends the bounding box to the backend
6. Backend validates the bounding box
7. Backend connects to AISStream
8. Backend subscribes to AIS data for the bounding box
9. AISStream sends raw AIS PositionReport messages
10. Backend normalizes raw messages into Vessel objects
11. Backend stores the latest vessel state in memory
12. Backend sends incremental vessel updates to the frontend
13. Frontend updates MobX state
14. MapLibre GL source is updated
15. Vessels are rendered on the map
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- MobX
- mobx-react-lite
- MapLibre GL JS

### Backend

- Node.js
- TypeScript
- ws
- dotenv
- tsx

### External Data Source

- AISStream WebSocket API

### Development

- ESLint
- GitHub Actions CI
- Node.js 24

## Project Structure

```txt
project-root/
  server/
    app/
      env.ts
      logger.ts

    ais/
      aisNormalizer.ts
      aisStreamClient.ts
      aisTypes.ts

    config/
      boundingBoxes.ts

    realtime/
      isValidBoundingBox.ts
      wsServer.ts

    vessels/
      vesselRepository.ts
      vesselService.ts

    index.ts

  shared/
    contracts/
      realtimeMessages.ts
      realtimeMessageTypes.ts
      serverStatuses.ts
      vessel.ts

  src/
    app/
      App.tsx
      App.css
      rootStore.ts
      RootStoreContext.tsx

    stores/
      RootStore.ts
      UserLocationStore.ts
      VesselsStore.ts

    shared/
      api/
        RealtimeClient.ts

      config/
        realtime.ts

    features/
      map/
        components/
          LocateMeButton.tsx
          MapOverlay.tsx
          VesselsMap.tsx

        config/
          defaultBoundingBoxes.ts
          mapStyle.ts

        hooks/
          useInitialAisSubscription.ts
          useMapInstance.ts
          useUserLocationOnMap.ts
          useVesselsMapSource.ts

        lib/
          createVesselTriangleImageData.ts
          createVesselsGeoJson.ts
          getMapBoundingBox.ts

        styles/
          map.css

  .github/
    workflows/
      ci.yml

  .env.example
  .gitignore
  .nvmrc
  README.md
  SECURITY.md
  package.json
  tsconfig.json
  vite.config.ts
```

## Backend Architecture

The backend is responsible for:

- reading server-side environment variables
- connecting to AISStream
- validating client subscription bounding boxes
- normalizing raw AIS messages
- storing the latest vessel state in memory
- broadcasting realtime updates to connected frontend clients

### `server/ais`

Handles the external AISStream integration.

Responsibilities:

- connect to AISStream WebSocket API
- send subscription payload
- receive raw AIS messages
- parse incoming messages
- normalize AIS data
- handle reconnect lifecycle

### `server/vessels`

Contains vessel domain logic.

Current implementation stores vessels in memory using a `Map`, where the key is the vessel MMSI.

This layer can later be backed by Redis, PostgreSQL, or PostGIS.

### `server/realtime`

Handles frontend WebSocket communication.

Responsibilities:

- accept frontend WebSocket clients
- send initial vessel snapshot
- receive subscription messages
- validate bounding boxes
- broadcast incremental vessel updates

### `server/app`

Contains application-level infrastructure:

- environment configuration
- logger

## Frontend Architecture

The frontend is organized around app composition, stores, shared infrastructure, and feature modules.

### `src/app`

Application composition layer.

Contains:

- root React component
- RootStore provider
- application-level context
- root store instance

### `src/stores`

MobX stores.

Stores contain observable state, actions, and computed values.

Stores do not own low-level transport objects such as WebSocket connections.

Current stores:

- `RootStore`
- `VesselsStore`
- `UserLocationStore`

### `src/shared`

Frontend shared infrastructure.

Current modules:

- `RealtimeClient`
- realtime config

### `src/features/map`

Map feature module.

Contains:

- MapLibre GL component
- map overlay
- locate-me button
- map lifecycle hooks
- GeoJSON helpers
- vessel icon generation
- map style configuration

## State Management

The project uses MobX with explicit annotations.

The project intentionally avoids `makeAutoObservable`.

Store rules:

- use `makeObservable`
- declare observables explicitly
- declare actions explicitly
- declare computed values explicitly
- do not store WebSocket lifecycle inside domain stores
- do not make technical objects observable
- keep side effects in clients, hooks, or orchestration layers

Example:

```ts
makeObservable(this, {
    vessels: observable,
    status: observable,
    error: observable,

    handleRealtimeMessage: action,
    upsertVessel: action,
    setStatus: action,

    vesselsList: computed,
    vesselsCount: computed,
})
```

## RootStore and React Context

The app uses `RootStore` as a composition root.

`RootStore` creates and connects:

- `VesselsStore`
- `UserLocationStore`
- `RealtimeClient`

React Context is used to provide the root store to the component tree.

This avoids direct singleton imports inside feature components and makes the app easier to test, mock, and extend.

Instead of importing stores directly:

```ts
import { vesselsStore } from './stores/VesselsStore'
```

components access stores through hooks:

```ts
const vesselsStore = useVesselsStore()
```

## Realtime Client

The frontend WebSocket transport is handled by `RealtimeClient`.

Responsibilities:

- open the WebSocket connection to the local backend proxy
- parse incoming server messages
- send AIS subscription messages
- keep the latest subscription until the socket is open
- avoid mixing transport lifecycle with MobX domain stores

The latest AIS subscription is stored and sent once the WebSocket connection becomes available.

This makes the client resilient to cases where the map bounding box is ready before the socket is fully opened.

## Map Architecture

The MapLibre GL lifecycle is split into dedicated hooks.

Current hooks:

- `useMapInstance`
- `useVesselsMapSource`
- `useUserLocationOnMap`
- `useInitialAisSubscription`

This keeps `VesselsMap` small and focused on composition.

### Vessel Rendering

Vessels are rendered as simple triangular navigation markers.

The marker rotation is based on:

```txt
heading → cog → 0
```

Map data is converted into GeoJSON before being passed to MapLibre.

GeoJSON coordinates use:

```txt
[longitude, latitude]
```

AISStream bounding boxes use:

```txt
[[southLat, westLon], [northLat, eastLon]]
```

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

The frontend should only know the backend WebSocket URL.

Correct data flow:

```txt
React frontend
   ↓
Local backend WebSocket proxy
   ↓
AISStream
```

Incorrect data flow:

```txt
React frontend
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

Create and commit `.env.example`:

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

Install dependencies:

```bash
npm install
```

Required runtime dependencies include:

```bash
npm i mobx mobx-react-lite maplibre-gl ws dotenv
```

Required development dependencies include:

```bash
npm i -D tsx concurrently @types/ws @types/geojson
```

## Running Locally

Start both the backend proxy and Vite frontend:

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

Example package scripts:

```json
{
    "scripts": {
        "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
        "dev:client": "vite",
        "dev:server": "tsx server/index.ts",
        "typecheck": "tsc --noEmit",
        "lint": "eslint .",
        "build": "tsc && vite build",
        "preview": "vite preview"
    }
}
```

## Geolocation Flow

When the app starts:

1. The browser requests the user’s current location.
2. The map centers on the received location.
3. The current map viewport is converted into a bounding box.
4. The bounding box is sent to the backend.
5. The backend subscribes to AISStream for that area.

If geolocation is not available or permission is denied, the app can fall back to predefined bounding boxes.

## AIS Bounding Boxes

Default or fallback AIS bounding boxes are configured in:

```txt
src/features/map/config/defaultBoundingBoxes.ts
```

Backend defaults can be configured in:

```txt
server/config/boundingBoxes.ts
```

Bounding box format:

```ts
;[
    [southLat, westLon],
    [northLat, eastLon],
]
```

Example:

```ts
export const FALLBACK_BOUNDING_BOXES = [
    [
        [51.7, 3.3],
        [52.7, 5.4],
    ],
]
```

## CI

The project uses GitHub Actions for CI.

The workflow runs on push and pull request.

Current checks:

- install dependencies
- TypeScript typecheck
- ESLint
- production build

Node.js version:

```txt
24
```

## Current Limitations

This is still an early prototype.

Current limitations:

- no persistent storage
- no historical vessel tracks
- no selected vessel details panel
- no vessel search
- no vessel filtering
- no route replay
- no authentication
- no production deployment setup
- vessel data is stored only in memory
- AIS data completeness depends on AISStream coverage and availability

## Roadmap

Planned improvements:

- add selected vessel state
- click vessel in list to focus map
- click vessel marker to open details panel
- add vessel search
- add filters by vessel name, MMSI, speed, and area
- add vessel trails
- add heading vectors
- add map bbox resubscription with debounce
- add persistent storage
- add route replay mode
- add Docker setup
- add unit tests for AIS normalization
- add unit tests for bbox validation
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
