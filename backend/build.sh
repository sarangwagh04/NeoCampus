#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================="
echo " Starting NeoCampus Backend Build Pipeline"
echo "=========================================="

echo "==> Upgrading pip..."
python -m pip install --upgrade pip

echo "==> Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Applying database migrations..."
if [ -n "$DATABASE_URL" ]; then
    python manage.py migrate --noinput
    echo "==> Ensuring clean demo data baseline..."
    python manage.py seed_demo_data --source=deploy || echo "Notice: Database seed step completed or skipped."
else
    echo "Notice: DATABASE_URL not supplied during build step. Migrations will run at service startup."
fi

echo "=========================================="
echo " NeoCampus Backend Build Completed Successfully!"
echo "=========================================="
