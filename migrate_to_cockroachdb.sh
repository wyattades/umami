set -eo pipefail

from_db="$FROM_DB"
to_db="$TO_DB"

tables="account website session event pageview"
tmp_path="/tmp/dump.sql"

# ---

echo "Dumping tables: $tables"

tables_as_options=$(echo " $tables" | sed 's/ / -t /g')

pg_dump $tables_as_options -a -d "$from_db" > "$tmp_path"

echo "Resetting destination database..."
psql -v ON_ERROR_STOP=1 -d "$to_db" -c "DROP DATABASE IF EXISTS defaultdb; CREATE DATABASE defaultdb;"

echo "Running migrations..."
DATABASE_URL="$to_db" npx prisma migrate deploy --schema=./db/cockroachdb/schema.prisma

echo "Restoring tables to destination database..."

psql -v ON_ERROR_STOP=1 -d "$to_db" < "$tmp_path"
