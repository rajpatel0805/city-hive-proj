class AddNotNullConstraintToMessagesUserId < ActiveRecord::Migration[7.1]
  def up
    # First, remove any existing NULL values
    execute "UPDATE messages SET user_id = 1 WHERE user_id IS NULL"
    
    # Then add the NOT NULL constraint
    change_column_null :messages, :user_id, false
  end

  def down
    change_column_null :messages, :user_id, true
  end
end 