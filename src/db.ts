import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://alibek:test1234@crud-system.sfsjwzf.mongodb.net/mini-chat?retryWrites=true&w=majority&appName=crud-system');
        console.log('MongoDB connected...');
    } catch (err:any) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;