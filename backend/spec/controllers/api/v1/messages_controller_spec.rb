require 'rails_helper'

RSpec.describe Api::V1::MessagesController, type: :controller do
  describe 'POST #process_status_callback' do
    let(:message) { create(:message, message_sid: 'test_sid_123') }
    let(:valid_params) do
      {
        MessageSid: 'test_sid_123',
        MessageStatus: 'delivered',
        ErrorMessage: nil
      }
    end

    before do
      # Mock Twilio signature validation
      allow_any_instance_of(Twilio::Security::RequestValidator).to receive(:validate).and_return(true)
    end

    context 'with valid parameters' do
      it 'updates the message status' do
        post :process_status_callback, params: valid_params
        expect(response).to have_http_status(:ok)
        message.reload
        expect(message.status).to eq('delivered')
      end

      it 'updates error information when present' do
        error_params = valid_params.merge(
          MessageStatus: 'failed',
          ErrorMessage: 'Message delivery failed'
        )
        post :process_status_callback, params: error_params
        expect(response).to have_http_status(:ok)
        message.reload
        expect(message.status).to eq('failed')
        expect(message.error_message).to eq('Message delivery failed')
      end
    end

    context 'with invalid parameters' do
      it 'returns not found when message_sid is not found' do
        post :process_status_callback, params: { MessageSid: 'non_existent_sid' }
        expect(response).to have_http_status(:not_found)
      end

      it 'handles missing MessageSid parameter' do
        post :process_status_callback, params: { MessageStatus: 'delivered' }
        expect(response).to have_http_status(:not_found)
      end

      it 'handles missing MessageStatus parameter' do
        post :process_status_callback, params: { MessageSid: message.message_sid }
        expect(response).to have_http_status(:ok)
        message.reload
        expect(message.status).to be_nil
      end

      it 'returns unprocessable_entity when update fails' do
        allow_any_instance_of(Message).to receive(:update).and_return(false)
        allow_any_instance_of(Message).to receive(:errors).and_return(
          double(full_messages: ['Status is invalid'])
        )

        post :process_status_callback, params: valid_params
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq({ 'errors' => ['Status is invalid'] })
      end
    end

    context 'with malicious requests' do
      it 'handles SQL injection attempts in MessageSid' do
        post :process_status_callback, params: { 
          MessageSid: "test_sid_123' OR '1'='1",
          MessageStatus: 'delivered'
        }
        expect(response).to have_http_status(:not_found)
      end

      it 'handles XSS attempts in ErrorMessage' do
        xss_message = "<script>alert('xss')</script>"
        post :process_status_callback, params: {
          MessageSid: message.message_sid,
          MessageStatus: 'failed',
          ErrorMessage: xss_message
        }
        expect(response).to have_http_status(:ok)
        message.reload
        expect(message.error_message).to eq(xss_message)
      end

      it 'handles extremely long parameters' do
        long_message = 'x' * 1000
        post :process_status_callback, params: {
          MessageSid: message.message_sid,
          MessageStatus: 'failed',
          ErrorMessage: long_message
        }
        expect(response).to have_http_status(:ok)
        message.reload
        expect(message.error_message).to eq(long_message)
      end
    end

    context 'with different HTTP methods' do
      it 'rejects GET requests' do
        get :process_status_callback, params: valid_params
        expect(response).to have_http_status(:method_not_allowed)
      end

      it 'rejects PUT requests' do
        put :process_status_callback, params: valid_params
        expect(response).to have_http_status(:method_not_allowed)
      end

      it 'rejects DELETE requests' do
        delete :process_status_callback, params: valid_params
        expect(response).to have_http_status(:method_not_allowed)
      end
    end
  end
end 