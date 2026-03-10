import mongoose from 'mongoose';
import colors from 'colors';
export default async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ChatBot');
        console.log(colors.green('Connected to MongoDB!'));
    } catch (error) {
        console.error(colors.red('Error connecting to MongoDB:', error));
        process.exit(1);
    }
}