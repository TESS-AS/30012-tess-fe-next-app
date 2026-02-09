import { baseURL, defaultHeaders } from "@/lib/axiosConfig";
import axios from "axios";

const axiosClient = axios.create({
	baseURL,
	withCredentials: true,
	headers: defaultHeaders,
	timeout: 30000, // 30 second timeout to prevent hanging requests
});

axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			console.warn("Unauthorized - maybe session expired?");
		}
		// Log timeout errors for monitoring
		if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
			console.warn("Request timeout:", error.config?.url);
		}
		return Promise.reject(error);
	},
);

export default axiosClient;
