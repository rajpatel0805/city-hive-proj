FactoryBot.define do
  factory :message do
    user_id { create(:user).id }
    body { Faker::Lorem.sentence }
    to_phone_number { Faker::PhoneNumber.cell_phone }
    status { 'pending' }
    message_sid { nil }
    error_message { nil }
  end
end 