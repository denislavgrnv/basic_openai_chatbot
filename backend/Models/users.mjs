import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: [2, "Name must be at least 2 characters!"],
        maxlength: [100, "Name cannot exceed 100 characters!"],
    },
    email: {
        type: String,
        unique: true,
        validate: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email!"],
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters!"],
    },
});

const User = model("User", userSchema);

export default User;