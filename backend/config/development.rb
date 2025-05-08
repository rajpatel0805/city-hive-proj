Rails.application.configure do
  # ... existing code ...

  # Redis configuration for development
  config.redis_url = ENV['REDIS_URL'] || 'redis://localhost:6379'
  
  # ... existing code ...
end 