#!/bin/bash
set -e

cd /var/app/current

PYTHON=$(command -v python3)

$PYTHON manage.py migrate --noinput
$PYTHON manage.py seed