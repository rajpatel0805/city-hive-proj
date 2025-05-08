class AddPhoneNumberToMessage < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :phone_number, :string
  end
end
