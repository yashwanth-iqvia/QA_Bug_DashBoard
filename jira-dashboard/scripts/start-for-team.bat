@echo off
title QA Bug Dashboard - Team Share
cd /d "%~dp0.."
echo.
echo Starting QA Bug Dashboard for team access...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0share-dashboard.ps1"
echo.
echo Starting server... Keep this window open while team uses the dashboard.
echo.
npm run dev
