import axios from "axios";
import { cookies } from "next/headers";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_Base_URL}`,
  withCredentials: true, // sends cookies automatically
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/refreshtoken`, {
          method: "POST",
          
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          Authorization: `Bearer ${cookies().get("refresh_token")?.value}`, 
          },
        });

        if (refreshResponse.status !==201) {
          throw new Error("Failed to refresh token");
        }
        const cookie=cookies().get("access_token")?.value
if(cookie){
        cookies().delete("access_token")
console.log(refreshResponse.headers.getSetCookie())
                    }
                                        const [nameValue, ...options] = refreshResponse.headers.getSetCookie().join("").split(';').map(p => p.trim());
            const [name, value] = nameValue.split('=');
            const maxAgeStr = options.find(o => o.toLowerCase().startsWith('max-age='))?.split('=')[1];
            cookies().set({
              name,
              value,
              maxAge: maxAgeStr !== undefined ? Number(maxAgeStr) : undefined,
              path: '/',
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
            });
          
        
        

        const data = await refreshResponse.json();
        const newAccessToken = data.accessToken;
  originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

  api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
