import { Schema, model } from "mongoose";

const userSchema = new Schema({
    firstName: {
        type: String,
        unique: true,
        validate: [/^[a-zA-Z]+$/, "Invalid first name!"],
        minLength: [2, "First name should be at least 2 characters long!"],
    },
    lastName: {
        type: String,
        validate: [/^[a-zA-Z]+$/, "Invalid last name!"],
        minLength: [2, "Last name should be at least 2 characters long!"],
    },
});

const User = model("User", userSchema);

export default User;