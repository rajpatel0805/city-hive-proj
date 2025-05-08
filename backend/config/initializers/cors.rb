# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:4200',
            'http://localhost:3000',
            'https://quiet-treacle-3813ef.netlify.app',
            'https://www.quiet-treacle-3813ef.netlify.app',
            'https://city-hive-proj-production.up.railway.app/resque'

    resource '*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options, :head],
             expose: ['Authorization'],
             credentials: true,
             max_age: 600
  end
end
