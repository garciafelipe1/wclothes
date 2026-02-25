#!/bin/sh
# Espera a que PostgreSQL esté listo

set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "PostgreSQL no está listo - esperando..."
  sleep 1
done

>&2 echo "PostgreSQL está listo - ejecutando comando"
exec $cmd


