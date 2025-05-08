class HealthController < ApplicationController
  skip_before_action :authenticate_user_from_token!

  def index
    render json: { status: 'ok' }
  end
end 