Rails.application.routes.draw do
  scope '/api/v1', defaults: { format: :json } do
    devise_for :users,
      path: 'users',
      path_names: {
        sign_in: 'sign_in',
        sign_out: 'sign_out',
        registration: 'sign_up'
      },
      controllers: {
        sessions: 'auth_controller_api_v1',
        registrations: 'registrations_controller_api_v1'
      }

    get 'health', to: 'health_controller_api_v1#index'
    resources :messages, controller: 'messages_controller_api_v1', only: [:create, :index, :destroy]
    post 'messages/process_status_callback', to: 'messages_controller_api_v1#process_status_callback'
  end

  get "up" => "rails/health#show", as: :rails_health_check

  # Mount Resque web interface
  require 'resque/server'
  mount Resque::Server.new, at: '/resque'
end
