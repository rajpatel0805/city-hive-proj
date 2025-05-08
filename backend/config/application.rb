# config/application.rb
require_relative "boot"

# Instead of `require "rails/all"`, pick only the frameworks you need:
require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"
# If you use Sprockets / assets, uncomment:
# require "sprockets/railtie"
# If you use ActiveStorage, uncomment:
# require "active_storage/engine"
# If you use TestUnit, uncomment:
# require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

module Backend
  class Application < Rails::Application
    # …
    config.generators do |g|
      g.orm :mongoid
    end
  end
end
