# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?
# Uncomment the line below in case you have `--require rails_helper` in the `.rspec` file
# that will avoid rails generators crashing because migrations haven't been run yet
return unless Rails.env.test?
require 'rspec/rails'
require 'mongoid-rspec'
require 'shoulda-matchers'
# Add additional requires below this line. Rails is not loaded until this point!

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
Dir[Rails.root.join('spec/support/**/*.rb')].sort.each { |f| require f }

# Remove ActiveRecord migration check since we're using MongoDB
# begin
#   ActiveRecord::Migration.maintain_test_schema!
# rescue ActiveRecord::PendingMigrationError => e
#   abort e.to_s.strip
# end

RSpec.configure do |config|
  # Remove ActiveRecord-specific configurations
  config.use_transactional_fixtures = false
  config.use_active_record = false

  # RSpec Rails uses metadata to mix in different behaviours to your tests
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!

  # Add FactoryBot methods
  config.include FactoryBot::Syntax::Methods

  # Include Mongoid matchers
  config.include Mongoid::Matchers, type: :model

  # Clean database between tests
  config.before(:each) do
    Mongoid.purge!
  end

  config.mock_with :mocha
end

# Configure Mongoid for testing
Mongoid.configure do |config|
  config.connect_to('city_hive_proj_test')
end

# Configure shoulda-matchers
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    # with.library :active_model
  end
end

# Include Mongoid matchers
RSpec.configure do |config|
  config.include Mongoid::Matchers, type: :model
end
