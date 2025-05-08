class Message < ApplicationRecord
  # your code here
  belongs_to :user

  validates :body, presence: true
  validates :phone_number, presence: true
  validates :user_id, presence: true

  def send_message_to_twilio!
    return if self.status.blank?

    self.update!(status: 'sending')
    client = Twilio::REST::Client.new(
      ENV['TWILIO_ACCOUNT_SID'],
      ENV['TWILIO_AUTH_TOKEN']
    )

    res = client.messages.create()
    self.update!(message_sid: res.sid)
  end

end
