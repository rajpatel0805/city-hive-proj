class RegistrationsController < Devise::RegistrationsController
  skip_before_action :verify_authenticity_token
  respond_to :json

  def create
    Rails.logger.debug "RegistrationsController#create called"
    Rails.logger.debug "Raw request body: #{request.raw_post}"
    Rails.logger.debug "Content-Type: #{request.content_type}"
    Rails.logger.debug "All params: #{params.inspect}"
    Rails.logger.debug "User params: #{params[:user].inspect}"
    
    build_resource(sign_up_params)
    Rails.logger.debug "Resource built: #{resource.inspect}"

    if resource.save
      Rails.logger.debug "Resource saved successfully"
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
      Rails.logger.debug "Resource save failed: #{resource.errors.full_messages}"
      render json: {
        status: { code: 422, message: 'Registration failed.' },
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    Rails.logger.debug "Processing sign_up_params"
    Rails.logger.debug "Raw params: #{params.inspect}"
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