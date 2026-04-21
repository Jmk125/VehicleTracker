# Vehicle Tracker (Raspberry Pi + Node + SQLite)

This project now runs as a Node.js web app backed by a SQLite `.db` file.

## What changed
- Runs on a Node server (Express).
- Persists all vehicle data to `vehicle_tracker.db` (SQLite).
- Listens on **port 3050** by default to avoid conflicts.
- Binds to `0.0.0.0` so devices on your local network can access it.

## Raspberry Pi setup

```bash
cd /path/to/VehicleTracker
npm install
npm start
```

Open from another device on your network:

```text
http://<your-pi-ip>:3050
```

## Configuration

Environment variables:
- `PORT` (default: `3050`)
- `HOST` (default: `0.0.0.0`)
- `DB_PATH` (default: `./vehicle_tracker.db`)

Example:

```bash
PORT=3050 HOST=0.0.0.0 DB_PATH=/home/pi/vehicle_tracker.db npm start
```

## Data behavior
- On first run, the UI uses bundled starter data.
- As soon as you edit/add anything, data is stored in SQLite.
- Future loads pull from SQLite.
