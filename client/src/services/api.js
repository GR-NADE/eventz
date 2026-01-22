import apiClient from './apiClient';

export const registerUser = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

export const refreshToken = async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
}

export const createEvent = async (eventData) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
};

export const getUserEvents = async (userId) => {
    const response = await apiClient.get(`/events/user/${userId}`);
    return response.data;
};

export const getEventById = async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
};

export const updateEvent = async (eventId, eventData) => {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return response.data;
};

export const deleteEvent = async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response.data;
};

export const addGuest = async (guestData) => {
    const response = await apiClient.post('/guests', guestData);
    return response.data;
};

export const getEventGuests = async (eventId) => {
    const response = await apiClient.get(`/guests/event/${eventId}`);
    return response.data;
}

export const updateGuest = async (guestId, guestData) => {
    const response = await apiClient.put(`/guests/${guestId}`, guestData);
    return response.data;
};

export const deleteGuest = async (guestId) => {
    const response = await apiClient.delete(`/guests/${guestId}`);
    return response.data;
};