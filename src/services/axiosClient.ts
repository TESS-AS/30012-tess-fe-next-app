import { baseURL, defaultHeaders } from "@/lib/axiosConfig";
import axios from "axios";

const axiosClient = axios.create({
	baseURL,
	withCredentials: true,
	headers: defaultHeaders,
});

axiosClient.interceptors.request.use((config) => {
	// Only access localStorage in client-side environment
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("token");
		if (token) config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

axiosClient.interceptors.response.use(
	(res) => res,
	(err) => {
		// Only access localStorage in client-side environment
		if (typeof window !== "undefined" && err.response?.status === 401) {
			localStorage.removeItem("token");
		}
		console.error("API Error:", err);
		return Promise.reject(err);
	},
);

export default axiosClient;
