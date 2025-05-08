require 'rails_helper'
require 'twilio-ruby'

RSpec.describe Message, type: :model do
  describe 'validations' do
    it 'is invalid without a body' do
      message = Message.new(body: nil, to_phone_number: '123', user_id: BSON::ObjectId.new)
      expect(message).not_to be_valid
      expect(message.errors[:body]).to include("can't be blank")
    end

    it 'is invalid without a to_phone_number' do
      message = Message.new(body: 'hi', to_phone_number: nil, user_id: BSON::ObjectId.new)
      expect(message).not_to be_valid
      expect(message.errors[:to_phone_number]).to include("can't be blank")
    end

    it 'is invalid without a user_id' do
      message = Message.new(body: 'hi', to_phone_number: '123', user_id: nil)
      expect(message).not_to be_valid
      expect(message.errors[:user_id]).to include("can't be blank")
    end
  end

  describe 'associations' do
    it 'belongs to a user' do
      user = create(:user)
      message = Message.create(body: 'hi', to_phone_number: '123', user_id: user.id)
      expect(message.user).to eq(user)
    end
  end

  describe '#send_message_to_twilio!' do
    let(:user) { create(:user) }
    let(:message) { create(:message, user_id: user.id) }
    let(:twilio_client) { mock('Twilio::REST::Client') }
    let(:messages) { mock('messages') }
    let(:message_instance) { mock('message_instance', sid: 'test_sid_123') }

    before do
      Twilio::REST::Client.stubs(:new).returns(twilio_client)
      twilio_client.stubs(:messages).returns(messages)
      messages.stubs(:create).returns(message_instance)
    end

    context 'when status is present' do
      before do
        message.status = 'pending'
      end

      it 'sends message to Twilio and updates message_sid' do
        expected_options = {
          from: Message::TWILIO_PHONE_NUMBER,
          to: message.to_phone_number,
          body: message.body,
          status_callback: 'https://city-hive-proj-production.up.railway.app/api/v1/messages/process_status_callback'
        }

        messages.expects(:create).with(expected_options).returns(message_instance)
        message.send_message_to_twilio!
        expect(message.message_sid).to eq('test_sid_123')
      end
    end

    context 'when status is blank' do
      before do
        message.status = nil
      end

      it 'does not send message to Twilio' do
        messages.expects(:create).never
        message.send_message_to_twilio!
      end
    end
  end
end 