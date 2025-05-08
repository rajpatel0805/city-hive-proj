class AddMessageSidToMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :message_sid, :string
  end
end
