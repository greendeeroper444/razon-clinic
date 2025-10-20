import axios from 'axios';
import API_BASE_URL from '../ApiBaseUrl';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
};

//not trigger token refresh
const AUTH_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refreshToken',
    '/api/auth/logout',
    '/api/auth/requestPasswordReset',
    '/api/auth/resetPassword',
    '/api/auth/me'
];

const isAuthEndpoint = (url?: string): boolean => {
    if (!url) return false;
    return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};


axios.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axios.interceptors.response.use(
    (response) => { return response; },
    async (error) => {
        const originalRequest = error.config;

        if (isAuthEndpoint(originalRequest.url) || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(axios(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post('/api/auth/refreshToken');
                
                isRefreshing = false;
                onRefreshed('refreshed');
                
                return axios(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                
                //check if we're already on login or signup pages
                if (typeof window !== 'undefined' && 
                    !window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/signup') &&
                    !window.location.pathname.includes('/register')) {
                    const { useAuthenticationStore } = await import('../stores');
                    const logout = useAuthenticationStore.getState().logout;
                    await logout();
                    
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;