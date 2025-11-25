import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define the Interface
export interface IUser extends Document {
    username: string;
    email: string;
    tb_account_id: string; // Stored as string in Mongo, BigInt in code
}

// 2. Define the Schema
const UserSchema: Schema<IUser> = new Schema({
    username: String,
    email: String,
    tb_account_id: {
        type: String,
        required: true
    }
});

// 3. Prevent recompilation model error
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;