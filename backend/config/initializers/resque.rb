require 'resque'

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