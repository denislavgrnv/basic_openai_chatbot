import User from "../Models/users.mjs";

export const createUser = async (userData) => {
    const user = new User(userData);
    await user.save();
    return user;
}

export const findUserByEmailAndPassword = async (email, password) => {
    return await User.findOne({ email, password });
}