class MessagesControllerApiV1Controller < ApplicationController
  before_action :set_message, only: [:process_status_callback]
  before_action :validate_http_method, only: [:process_status_callback]
  before_action :authenticate_user!, except: [:process_status_callback]
  before_action :validate_twilio_request, only: [:process_status_callback]

  def create
    message = Message.new(
      body: params[:text],
      to_phone_number: params[:phone],
      user_id: current_user.id
    )

    if message.save
      SendTwilioMessageJob.perform_later(message.id.to_s)
      render json: {
        id: message.id,
        body: message.body,
        phone_number: message.to_phone_number,
        created_at: message.created_at&.iso8601,
        updated_at: message.updated_at&.iso8601,
        user_id: message.user_id
      }, status: :created
    else
      render json: { status: 'error', errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def index
    messages = current_user.messages.where(hidden: nil)
    render json: messages.map { |message|
      {
        id: message.id,
        body: message.body,
        phone_number: message.to_phone_number,
        created_at: message.created_at&.iso8601,
        updated_at: message.updated_at&.iso8601,
        user_id: message.user_id,
        status: message.status
      }
    }
  end

  def destroy
    message = current_user.messages.find(params[:id])
    message.update!(hidden: true)

    render json: {
      message: message
    }
  end

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
    auth_token = Rails.application.credentials.dig('TWILIO_AUTH_TOKEN')
    url = request.original_url
    params_hash = params.to_unsafe_h
    validator = Twilio::Security::RequestValidator.new(auth_token)
    twilio_signature = request.headers['X-Twilio-Signature']

    unless validator.validate(url, params_hash, twilio_signature)
      Rails.logger.error "Invalid Twilio signature for message #{params[:MessageSid]}"
      head :forbidden
    end
  end
end
