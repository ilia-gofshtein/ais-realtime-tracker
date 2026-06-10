# AIS Ship Radar

A pet project for receiving, processing, and visualizing live AIS vessel data in a web application.

The project connects to the AISStream WebSocket API through a local Node.js proxy server, normalizes incoming vessel position reports, stores the latest vessel state in memory, and sends live updates to a React frontend.

The current version is a simple prototype that displays received AIS data as text and table data. The architecture is prepared for future map visualization, vessel trails, filters, history, and storage.

## Table of Contents

- [Overview](#overview)
- [Project Goals](#project-goals)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Shared Contracts](#shared-contracts)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [AIS Bounding Boxes](#ais-bounding-boxes)
- [MobX Store Convention](#mobx-store-convention)
- [Current Limitations](#current-limitations)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

AIS Ship Radar is a small maritime data application built around live AIS vessel messages.

AIS stands for Automatic Identification System. Ships use AIS to broadcast information such as position, speed, course, heading, MMSI, and vessel metadata.

This project uses AISStream as an external AIS data source and provides a local application architecture around it.

Current functionality:

- connect to AISStream through a backend proxy
- receive live AIS position reports
- normalize incoming messages into internal vessel objects
- keep the latest vessel state in memory
- stream vessel data to the frontend
- display received vessels in a React UI

## Project Goals

The goal of this project is to build a clean and extendable AIS data application while keeping the first version simple.

Main goals:

- avoid exposing API keys in the browser
- keep backend and frontend responsibilities separate
- use explicit shared contracts between server and client
- start with a simple in-memory prototype
- prepare the structure for map visualization and historical data
- keep the project easy to run locally
- make the repository safe to publish publicly

Possible future features:

- live vessel map
- vessel heading indicators
- vessel trails
- port traffic monitoring
- vessel filtering
- geofencing zones
- route history
- replay mode
- simple anomaly detection
- PostgreSQL/PostGIS storage

## Architecture

The project follows a modular monolith approach.

It is intentionally not split into microservices at this stage. For a pet project, a modular monolith gives a better balance between simplicity and maintainability.

The repository contains both backend and frontend code, but the code is separated by responsibility.

```txt
AISStream
   ↓
server/ais
   ↓
server/vessels
   ↓
server/realtime
   ↓
React frontend
```

### Why Modular Monolith?

Microservices would add unnecessary complexity at this stage:

- multiple deployable services
- duplicated configuration
- network boundaries
- more infrastructure
- more operational overhead

A modular monolith keeps the project simple while still making the codebase easy to grow.

Each module has a clear responsibility:

- `server/ais` handles the external AISStream integration
- `server/vessels` handles vessel domain state
- `server/realtime` handles WebSocket communication with the frontend
- `shared/contracts` keeps backend and frontend types aligned
- `src/features` contains frontend feature modules

If the project grows, individual modules can later be extracted into separate services or packages.

## Data Flow

Current data flow:

```txt
1. Backend starts
2. Backend reads AISSTREAM_API_KEY from .env
3. Backend connects to AISStream WebSocket API
4. Backend sends subscription payload with bounding boxes
5. AISStream sends raw AIS PositionReport messages
6. Backend normalizes raw AIS messages into Vessel objects
7. VesselService stores the latest vessel state in memory
8. RealtimeServer sends vessel data to connected frontend clients
9. React frontend receives WebSocket messages
10. MobX store updates observable state
11. UI renders vessel data as text/table
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- MobX
- mobx-react-lite

### Backend

- Node.js
- TypeScript
- ws
- dotenv
- tsx

### External Data Source

- AISStream WebSocket API

## Project Structure

```txt
project-root/
  server/
    index.ts

    app/
      env.ts

    ais/
      aisStreamClient.ts
      aisNormalizer.ts
      aisTypes.ts

    config/
      boundingBoxes.ts

    realtime/
      wsServer.ts

    vessels/
      vesselRepository.ts
      vesselService.ts

  shared/
    contracts/
      vessel.ts
      realtimeMessages.ts

  src/
    app/
      App.tsx
      App.css

    features/
      vessels/
        components/
          VesselsTable.tsx

    stores/
      VesselsStore.ts

    shared/
      config/
        realtime.ts

  .env.example
  .gitignore
  package.json
  tsconfig.json
  vite.config.ts
```

## Backend Structure

The backend is located in the `server` directory.

### `server/index.ts`

Application entry point.

Responsible for:

- creating the HTTP server
- creating repositories and services
- creating the realtime WebSocket server
- creating the AISStream client
- starting the backend server

### `server/app`

Application-level configuration.

```txt
server/app/
  env.ts
```

`env.ts` reads environment variables and validates required values.

### `server/ais`

External AIS integration module.

```txt
server/ais/
  aisStreamClient.ts
  aisNormalizer.ts
  aisTypes.ts
```

Responsibilities:

- connect to AISStream
- send AISStream subscription payload
- receive raw WebSocket messages
- parse incoming AIS messages
- normalize raw data into internal vessel objects
- handle reconnect logic

### `server/vessels`

Vessel domain module.

```txt
server/vessels/
  vesselRepository.ts
  vesselService.ts
```

Responsibilities:

- store latest vessel state
- update vessel position data
- provide current vessel snapshot
- isolate vessel domain logic from transport logic

At the current stage, vessels are stored in memory using a `Map`.

The key is the vessel MMSI.

### `server/realtime`

Frontend realtime communication module.

```txt
server/realtime/
  wsServer.ts
```

Responsibilities:

- accept frontend WebSocket connections
- send initial vessel snapshot
- broadcast vessel updates
- handle frontend subscription messages

### `server/config`

Backend configuration files.

```txt
server/config/
  boundingBoxes.ts
```

Currently stores default AIS bounding boxes.

## Frontend Structure

The frontend is located in the `src` directory.

```txt
src/
  app/
  features/
  stores/
  shared/
```

### `src/app`

Application composition layer.

```txt
src/app/
  App.tsx
  App.css
```

Contains the root application component and global application styles.

### `src/features`

Feature-based UI modules.

Current feature:

```txt
src/features/vessels/
```

Possible future features:

```txt
src/features/map/
src/features/filters/
src/features/zones/
src/features/history/
src/features/alerts/
```

### `src/stores`

MobX stores.

Current store:

```txt
src/stores/VesselsStore.ts
```

The store receives WebSocket messages from the backend and keeps frontend vessel state.

### `src/shared`

Frontend shared utilities, configuration, and helpers.

Example:

```txt
src/shared/config/realtime.ts
```

## Shared Contracts

The `shared/contracts` directory contains TypeScript types shared between backend and frontend.

```txt
shared/contracts/
  vessel.ts
  realtimeMessages.ts
```

This avoids duplicating message types on both sides and keeps the WebSocket API explicit.

Example contract types:

- `Vessel`
- `BoundingBox`
- `ServerToClientMessage`
- `ClientToServerMessage`

## Security

This repository is intended to be public.

Because of that, API key handling is important.

The AISStream API key must never be committed to the repository and must never be exposed to the browser.

Do not place the AISStream token in frontend environment variables.

Incorrect:

```env
VITE_AISSTREAM_API_KEY=your_real_key_here
```

Any environment variable starting with `VITE_` can be exposed to the browser bundle.

Correct:

```env
AISSTREAM_API_KEY=your_real_key_here
```

The AISStream key should be read only by the Node.js backend.

The frontend should connect only to the local backend proxy:

```txt
React frontend
   ↓
Local backend WebSocket proxy
   ↓
AISStream
```

Before publishing the repository, make sure:

- `.env` is included in `.gitignore`
- real API keys were never committed
- only `.env.example` is committed
- no token appears in source code
- no token appears in README examples
- no token appears in screenshots or logs

If a real token was accidentally committed, rotate the token immediately.

## Environment Variables

Create a local `.env` file in the project root.

```env
AISSTREAM_API_KEY=your_aisstream_api_key_here
PORT=3001
```

Create `.env.example` and commit it to the repository:

```env
AISSTREAM_API_KEY=your_aisstream_api_key_here
PORT=3001
VITE_REALTIME_WS_URL=ws://localhost:3001/ws
```

Make sure `.env` is ignored by Git:

```gitignore
.env
.env.local
.env.*.local
```

`VITE_REALTIME_WS_URL` is safe to expose because it contains only the frontend-to-backend WebSocket URL, not a secret.

## Installation

Install project dependencies:

```bash
npm install
```

Required dependencies:

```bash
npm i mobx mobx-react-lite
npm i ws dotenv
npm i -D tsx concurrently @types/ws
```

## Running Locally

Start the backend proxy and Vite frontend together:

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

Example `package.json` scripts:

```json
{
    "scripts": {
        "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
        "dev:client": "vite",
        "dev:server": "tsx server/index.ts",
        "build": "tsc && vite build",
        "preview": "vite preview"
    }
}
```

## AIS Bounding Boxes

Default AIS bounding boxes are configured in:

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
export const DEFAULT_BOUNDING_BOXES = [
    [
        [51.7, 3.3],
        [52.7, 5.4],
    ],
]
```

The default area can be changed depending on what region should be monitored.

For example:

- Amsterdam / North Sea Canal
- Rotterdam
- Antwerp
- English Channel
- Baltic Sea
- any custom area supported by AISStream coverage

## MobX Store Convention

The project uses MobX for frontend state management.

Stores should use explicit MobX annotations with `makeObservable`.

The project intentionally avoids `makeAutoObservable`.

Recommended store rules:

- declare observable fields explicitly
- declare actions explicitly
- declare computed values explicitly
- do not make technical side-effect objects observable
- keep WebSocket, timers, and controllers private when possible
- update state through actions
- keep transport parsing separate from UI components

Example convention:

```ts
constructor() {
  makeObservable<this, "handleServerMessage">(this, {
    vessels: observable,
    status: observable,
    error: observable,

    connect: action,
    disconnect: action,
    upsertVessel: action,

    handleServerMessage: action,

    vesselsList: computed,
    vesselsCount: computed,
  });
}
```

Objects that should not be observable:

- `WebSocket`
- `AbortController`
- timers
- API clients
- low-level transport objects

## Current Limitations

This is an early prototype.

Current limitations:

- no map visualization yet
- no persistent storage
- no historical vessel tracks
- no filtering UI
- no authentication
- no production deployment setup
- vessel data is stored only in memory
- AIS data completeness depends on AISStream coverage and availability
- current UI is focused on debugging and text/table output

## Roadmap

Planned improvements:

- send incremental vessel updates instead of full snapshots on every update
- add map visualization with MapLibre GL or Leaflet
- render vessel markers with heading direction
- add vessel trails for recent movement history
- add filters by vessel name, MMSI, speed, and area
- add selected vessel details panel
- add storage for historical positions
- add route replay mode
- add Docker setup
- add unit tests for AIS normalization
- add unit tests for vessel repository logic
- add README screenshots or demo GIF
- add CI checks for linting, typechecking, and tests

## Public Repository Checklist

Before pushing the repository publicly:

- [ ] `.env` is listed in `.gitignore`
- [ ] `.env.example` exists and contains only placeholder values
- [ ] no real API keys are present in source code
- [ ] no real API keys are present in README
- [ ] no real API keys are present in screenshots
- [ ] `git status` does not include `.env`
- [ ] project starts with `npm run dev`
- [ ] frontend works without direct access to AISStream
- [ ] backend reads the AISStream key from server-side environment variables only

Optional check before first public push:

```bash
git grep -n "AISSTREAM_API_KEY"
```

Also check for accidental token-like strings:

```bash
git grep -n "VITE_AIS"
```

## License

This project is currently intended as a personal pet project.

A license can be added later depending on how the repository will be used.
