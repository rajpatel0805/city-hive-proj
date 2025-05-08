namespace :resque do
  desc "Start Resque workers"
  task :start_workers => :environment do
    require 'resque'
    
    # Start workers
    workers = ENV['COUNT'] || 2
    queues = ENV['QUEUE'] || '*'
    
    puts "Starting #{workers} Resque workers for queues: #{queues}"
    
    # Redis configuration
    redis_config = {
      url: ENV['REDIS_URL'] || 'redis://localhost:6379',
      ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE },
      timeout: 1,
      reconnect_attempts: 3
    }
    
    # Start the workers
    workers.to_i.times do
      pid = fork do
        Resque.redis = Redis.new(redis_config)
        worker = Resque::Worker.new(queues.split(','))
        worker.work
      end
      
      Process.detach(pid)
    end
  end

  desc "Stop all Resque workers"
  task :stop_workers => :environment do
    pids = `ps aux | grep [r]esque | awk '{print $2}'`.split("\n")
    if pids.empty?
      puts "No Resque workers running"
    else
      pids.each do |pid|
        puts "Stopping Resque worker #{pid}"
        Process.kill("TERM", pid.to_i)
      end
    end
  end

  desc "Check Redis connection"
  task :check_redis => :environment do
    require 'resque'
    begin
      redis_url = ENV['REDIS_URL'] || 'redis://localhost:6379'
      redis = Redis.new(url: redis_url)
      redis.ping
      puts "Successfully connected to Redis at #{redis_url}"
    rescue Redis::CannotConnectError => e
      puts "Failed to connect to Redis: #{e.message}"
      puts "Redis URL: #{redis_url}"
      exit 1
    end
  end
end 