@echo off
echo Starting Backend (Express Dev Server)...
start "Backend" cmd /k "cd server && node --env-file=.env dev-server.js"

echo Starting Frontend (Vite)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both services are starting in separate windows.
echo Use the respective windows to see their logs.
