class MessagesController < ApplicationController
  before_action :authenticate_user!

  def create
    message = Message.new(
      body: params[:text],
      phone_number: params[:phone],
      user_id: current_user.id
    )

    if message.save
      render json: {
        id: message.id,
        body: message.body,
        phone_number: message.phone_number,
        created_at: message.created_at&.iso8601,
        updated_at: message.updated_at&.iso8601,
        user_id: message.user_id
      }, status: :created
      Resque.enqueue(SendTwilioMessageJob, message.id)
    else
      render json: { status: 'error', errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end


  #TODO: Add pagination
  def index
    @messages = current_user.messages.order(created_at: :desc)
    render json: @messages.map { |message| 
      {
        id: message.id,
        body: message.body,
        phone_number: message.phone_number,
        created_at: message.created_at&.iso8601,
        updated_at: message.updated_at&.iso8601,
        user_id: message.user_id
      }
    }
  end
end