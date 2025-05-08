class Api::V1::MessagesController < ActionController::API
  before_action :set_message, only: [:process_status_callback]
  before_action :validate_http_method, only: [:process_status_callback]
  before_action :authenticate_user!, except: [:process_status_callback]
  before_action :validate_twilio_request, only: [:process_status_callback]

  # POST /api/v1/messages/process_status_callback
  def process_status_callback
    return head :not_found unless @message

    if @message.update(
      status: params[:MessageStatus],
      error_message: params[:ErrorMessage]
    )
      head :ok
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_message
    @message = Message.find_by(message_sid: params[:MessageSid])
  end

  def validate_http_method
    Rails.logger.info "Request method: #{params.inspect}"

    unless request.post?
      head :method_not_allowed
    end
  end

  def validate_twilio_request
    # Get the Twilio auth token from credentials
    auth_token = Rails.application.credentials.dig('TWILIO_AUTH_TOKEN')
    
    # Get the full URL of the request
    url = request.original_url
    
    # Get all POST parameters
    params_hash = params.to_unsafe_h
    
    # Create a validator
    validator = Twilio::Security::RequestValidator.new(auth_token)
    
    # Get the X-Twilio-Signature header
    twilio_signature = request.headers['X-Twilio-Signature']
    
    # Validate the request
    unless validator.validate(url, params_hash, twilio_signature)
      Rails.logger.error "Invalid Twilio signature for message #{params[:MessageSid]}"
      head :forbidden
    end
  end
end 