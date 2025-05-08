#!/bin/bash
set -e

# Remove any pre-existing Rails server PID
rm -f /app/tmp/pids/server.pid

# Ensure any Mongoid-declared indexes exist
bundle exec rails db:mongoid:create_indexes

# Launch either the Resque worker or the Rails web server
if [ "$PROCESS_TYPE" = "worker" ]; then
  echo "Starting Resque worker..."
  bundle exec rake resque:work QUEUE=* COUNT=2
else
  echo "Starting Rails server..."
  bundle exec rails server -b 0.0.0.0
fi
