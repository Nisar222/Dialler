#!/usr/bin/env bash
set -e
node backend/dist/index.js &     # API (binds to $PORT)
node worker/dist/index.js &      # BullMQ worker (no port)
wait -n
