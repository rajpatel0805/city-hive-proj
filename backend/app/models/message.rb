class Message
  include Mongoid::Document
  include Mongoid::Timestamps
  include GlobalID::Identification

  field :body, type: String
  field :to_phone_number, type: String
  field :status, type: String
  field :message_sid, type: String
  field :error_message, type: String

  belongs_to :user, class_name: 'User', inverse_of: :messages

  validates :body, presence: true
  validates :to_phone_number, presence: true
  validates :user_id, presence: true

  TWILIO_PHONE_NUMBER = '+18446435371'

  def send_message_to_twilio!
    begin
      # If the message is already sent, don't send it again
      return if self.status.present?
      client = Twilio::REST::Client.new(
        Rails.application.credentials.dig('TWILIO_ACCOUNT_SID'),
        Rails.application.credentials.dig('TWILIO_AUTH_TOKEN')
      )
      res = client.messages.create(
        from: TWILIO_PHONE_NUMBER,
        to: self.to_phone_number,
        body: self.body,
        status_callback: 'https://city-hive-proj-production.up.railway.app/api/v1/messages/process_status_callback'
      )
      self.update!(message_sid: res.sid)
    rescue => e
      self.update!(status: 'failed', error_message: e.message)
    end
  end
end
