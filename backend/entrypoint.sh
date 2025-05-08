#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails
rm -f /app/tmp/pids/server.pid

# Wait for PostgreSQL
until pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB
do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Run database migrations
bundle exec rails db:migrate

# Start the main process
if [ "$PROCESS_TYPE" = "worker" ]; then
  # Start Resque worker
  echo "Starting Resque worker..."
  bundle exec rake resque:work QUEUE=* COUNT=2
else
  # Start Rails server
  echo "Starting Rails server..."
  bundle exec rails server -b 0.0.0.0
fi 