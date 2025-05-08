class RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)
    if resource.save
      sign_in(resource_name, resource)
      token = generate_token(resource)
      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        data: {
          id: resource.id,
          email: resource.email,
          created_at: resource.created_at
        },
        token: token
      }
    else
      render json: {
        status: { code: 422, message: 'Registration failed.' },
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end

  def generate_token(user)
    # Generate a simple token using user's ID and a timestamp
    payload = {
      user_id: user.id,
      exp: 24.hours.from_now.to_i
    }
    Base64.strict_encode64(payload.to_json)
  end
end 