class MessagesController < ApplicationController
  before_action :authenticate_user!

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


  #TODO: Add pagination
  def index
    @messages = current_user.messages
    render json: @messages.map { |message| 
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
end