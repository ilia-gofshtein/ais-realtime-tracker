# Security Policy

## Overview

This project is intended to be safe for public repositories.

The application uses a backend proxy to communicate with the AISStream API. The AISStream API key must stay server-side and must never be exposed to the frontend or committed to the repository.

## Secrets Management

Do not commit real secrets to the repository.

Secrets include:

- AISStream API keys
- production API tokens
- database credentials
- private URLs with embedded tokens
- private certificates
- service account credentials

The AISStream API key must be stored only in a local `.env` file or in server-side environment variables.

Correct:

```env
AISSTREAM_API_KEY=your_real_key_here
```

Incorrect:

```env
VITE_AISSTREAM_API_KEY=your_real_key_here
```

Environment variables prefixed with `VITE_` can be exposed to the browser bundle and must not contain secrets.

## Environment Files

The following files must not be committed:

```txt
.env
.env.local
.env.*.local
```

A safe `.env.example` file may be committed with placeholder values only:

```env
AISSTREAM_API_KEY=your_aisstream_api_key_here
PORT=3001
VITE_REALTIME_WS_URL=ws://localhost:3001/ws
```

## Frontend Security Rule

The frontend must never connect directly to AISStream.

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

The frontend should only know the URL of the local backend WebSocket proxy.

## Before Publishing

Before pushing the repository publicly, check that no real secrets are present.

Recommended checks:

```bash
git status
```

Make sure `.env` is not listed.

Search for accidental secret references:

```bash
git grep -n "AISSTREAM_API_KEY"
git grep -n "VITE_AIS"
git grep -n "apiKey"
git grep -n "APIKey"
```

Also check screenshots, logs, documentation, and commit history if needed.

## If a Secret Was Committed

If a real API key or token was accidentally committed:

1. Revoke or rotate the exposed key immediately.
2. Remove the secret from the current codebase.
3. Remove the secret from Git history if necessary.
4. Force-push only if you understand the impact.
5. Assume the exposed key is compromised once it appears in a public repository.

Do not rely only on deleting the file in a later commit.

## Local Development

For local development:

1. Copy `.env.example` to `.env`.
2. Add a real AISStream API key to `.env`.
3. Keep `.env` local only.
4. Run the backend locally.
5. Connect the frontend to the local backend proxy.

## Reporting Security Issues

If you find a security issue in this project, please open a private report if the hosting platform supports it.

Do not publicly disclose active secrets, vulnerabilities, or exploit details before they are fixed.

## Current Security Scope

This project is currently a pet project and does not include:

- authentication
- authorization
- user accounts
- production deployment hardening
- rate limiting
- audit logging
- persistent secret storage

These areas may be added later if the project grows beyond a local prototype.
