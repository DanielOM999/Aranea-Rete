# Stopper ved første feil
set -e

# Sett verten og kommandoen som skal kjøres
host="$1"
shift
cmd="$@"

# Vent til Postgres er klar
until pg_isready -h "$host" >/dev/null 2>&1; do
  echo "Waiting for Postgres at $host…"
  sleep 2
done

# Bekreft at Postgres er oppe og kjør kommandoen
>&2 echo "Postgres is up – executing '$cmd'"
exec $cmd