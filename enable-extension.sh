#!/bin/bash
docker exec vg-ehrbase-n8n-ehrdb-1 psql -U postgres -d ehrbase -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
