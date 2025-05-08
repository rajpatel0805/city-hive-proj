Rails.application.routes.draw do
  get '/health', to: 'health#index'
  
  devise_for :users,
    path: 'users',
    path_names: {
      sign_in: 'sign_in',
      sign_out: 'sign_out',
      registration: 'sign_up'
    },
    controllers: {
      sessions: 'auth',
      registrations: 'registrations'
    }
    
  resources :messages, only: [:create, :show, :index]

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  root to: "user#index"
  resource :users
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  # Mount Resque web interface
  require 'resque/server'
  mount Resque::Server.new, at: '/resque'

  namespace :api do
    namespace :v1 do
      post 'messages/process_status_callback', to: 'messages#process_status_callback'
    end
  end
  
end
