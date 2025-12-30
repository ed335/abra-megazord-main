#!/bin/bash
cd /home/runner/workspace
npx concurrently --kill-others \
  "cd backend && npm run start:dev" \
  "sleep 5 && cd web && npm run dev -- -p 5000 -H 0.0.0.0"
