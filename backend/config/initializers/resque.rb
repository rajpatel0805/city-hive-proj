require 'resque'
require 'resque/server'
# Configure Redis connection
begin
  redis_url = ENV['REDIS_PUBLIC_URL'] || 'redis://localhost:6379'
  redis_config = {
    url: redis_url,
    ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE },
    timeout: 1,
    reconnect_attempts: 3
  }
  
  Resque.redis = Redis.new(redis_config)
  
  # Test the connection
  Resque.redis.ping
  Rails.logger.info "Successfully connected to Redis at #{redis_url}"
rescue Redis::CannotConnectError => e
  Rails.logger.error "Failed to connect to Redis: #{e.message}"
  Rails.logger.error "Redis URL: #{redis_url}"
  raise e
end

# Configure Resque logging
Resque.logger = Logger.new(STDOUT)
Resque.logger.level = Logger::INFO

# Configure Resque failure backend
require 'resque/failure/redis'
Resque::Failure.backend = Resque::Failure::Redis

# Add authentication for Resque web interface in production
if Rails.env.production?
  Resque::Server.use Rack::Auth::Basic do |username, password|
    ActiveSupport::SecurityUtils.secure_compare(
      ::Digest::SHA256.hexdigest(username),
      ::Digest::SHA256.hexdigest(Rails.application.credentials.dig('RESQUE_USERNAME'))
    ) &
    ActiveSupport::SecurityUtils.secure_compare(
      ::Digest::SHA256.hexdigest(password),
      ::Digest::SHA256.hexdigest(Rails.application.credentials.dig('RESQUE_PASSWORD'))
    )
  end
end 
