import api from '../api/requester.js';

const baseURL = "http://localhost:5000/api/conversations"

export const getConversations = async (userId) => {
    return await api.get(`${baseURL}/${userId}`);
};

export const delConvesations = async (conversationId) => {
    return await api.del(`${baseURL}/${conversationId}`);
}