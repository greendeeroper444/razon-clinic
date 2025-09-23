import axios from 'axios';
import API_BASE_URL from '../ApiBaseUrl';

//set default configuration
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

//function to add requests to queue while refreshing
const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

//function to notify all queued requests when refresh is complete
const onRefreshed = (token: string) => {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
};

//request interceptor
axios.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response interceptor for automatic token refresh
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        //check if error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                //if already refreshing, wait for it to complete
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        resolve(axios(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                //attempt to refresh the token
                await axios.post('/api/auth/refresh-token');
                
                isRefreshing = false;
                onRefreshed('refreshed');
                
                //retry the original request
                return axios(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                
                //refresh failed, redirect to login
                //get the auth store and logout
                const { useAuthenticationStore } = await import('../stores');
                const logout = useAuthenticationStore.getState().logout;
                await logout();
                
                //redirect to login page
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
)

export default axios