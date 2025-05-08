class AddStatusToMessage < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :status, :string
  end
end
