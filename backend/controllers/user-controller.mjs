import User from "../Models/users.mjs";

export const createUser = async (userData) => {
    const user = new User(userData);
    await user.save();
    return user;
}