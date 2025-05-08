class AuthController < Devise::SessionsController
  include Devise::Controllers::SignInOut
  include Devise::Controllers::Helpers

  protect_from_forgery with: :exception
  skip_before_action :verify_authenticity_token
  respond_to :json

  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    
    # Generate a simple token
    token = generate_token(resource)
    
    render json: {
      status: { code: 200, message: 'Signed in successfully.' },
      data: user_data,
      token: token
    }
  end

  def destroy
    signed_out = sign_out(resource_name)
    
    render json: {
      status: { code: 200, message: 'Signed out successfully.' }
    }
  end

  private

  def auth_options
    { scope: resource_name, recall: "#{controller_path}#new" }
  end

  def sign_in_params
    params.require(:user).permit(:email, :password)
  end

  def user_data
    return {} unless current_user
    {
      id: current_user.id,
      email: current_user.email,
      created_at: current_user.created_at
    }
  end

  def generate_token(user)
    # Generate a simple token using user's ID and a timestamp
    payload = {
      user_id: user.id,
      exp: 24.hours.from_now.to_i
    }
    Base64.strict_encode64(payload.to_json)
  end

  def respond_with(resource, _opts = {})
    render json: {
      status: { code: 200, message: 'Signed in successfully.' },
      data: user_data,
      token: generate_token(resource)
    }
  end
end
