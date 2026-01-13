import axios from 'axios';
import { API_URL } from '../config';

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

let authContext = null;

export const setAuthContext = (context) => {
    authContext = context;
};

apiClient.interceptors.request.use(
    (config) => {
        if (authContext)
        {
            const token = authContext.getAccessToken();
            if (token)
            {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry)
        {
            originalRequest._retry = true;

            try
            {
                if (authContext)
                {
                    const refreshToken = authContext.getRefreshToken();

                    if (refreshToken)
                    {
                        const refreshResponse = await axios.post(
                            `${API_URL}/auth/refresh-token`,
                            { refreshToken },
                            { timeout: 5000 }
                        );

                        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
                        authContext.updateTokens(accessToken, newRefreshToken);

                        originalRequest.headers.Authorization = `Bearer ${accessToken}`; 
                        return apiClient(originalRequest);
                    }
                }
            }
            catch (refreshError)
            {
                console.error('Token refresh failed:', refreshError);
                if (authContext)
                {
                    authContext.logout();
                    window.location.href = '/login';
                }
            }
        }

        if (error.response?.status === 403)
        {
            console.error('Access denied:', error.response.data?.error);
            if (authContext)
            {
                authContext.logout();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;