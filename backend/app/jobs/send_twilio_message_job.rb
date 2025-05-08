class SendTwilioMessageJob < ActiveJob::Base
  queue_as :default
  
  def perform(message_id)
    message = Message.find(message_id)
    message.send_message_to_twilio!
  end
end 
