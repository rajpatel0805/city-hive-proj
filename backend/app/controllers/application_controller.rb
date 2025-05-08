class ApplicationController < ActionController::Base
  before_action :authenticate_user_from_token!

  private

  def authenticate_user_from_token!
    return unless token = extract_token_from_request

    begin
      payload = JSON.parse(Base64.strict_decode64(token))
      if payload['exp'] && payload['exp'] > Time.now.to_i
        @current_user = User.find_by(id: payload['user_id'])
        sign_in(@current_user) if @current_user
      end
    rescue JSON::ParserError, ArgumentError
      # Invalid token format
    end
  end

  def extract_token_from_request
    auth_header = request.headers['Authorization']
    return nil unless auth_header && auth_header.start_with?('Bearer ')
    auth_header.split(' ').last
  end

  protected

  def current_user
    @current_user ||= super
  rescue NoMethodError
    @current_user
  end

  def user_signed_in?
    !!current_user
  end
end
