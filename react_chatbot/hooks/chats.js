import api from '../api/requester.js';

const baseURL = "http://localhost:5000/api/conversations"
const userId = "69adb2ba905f4761f8ea2c44";

export const getConversations = async () => {
    return await api.get(`${baseURL}/${userId}`);
};