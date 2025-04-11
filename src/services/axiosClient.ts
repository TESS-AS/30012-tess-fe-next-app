import { baseURL, defaultHeaders } from "@/lib/axiosConfig";
import axios from "axios";

const axiosClient = axios.create({
	baseURL,
	headers: defaultHeaders,
});

axiosClient.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

axiosClient.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err.response?.status === 401) {
			localStorage.removeItem("token");
		}
		console.error("API Error:", err);
		return Promise.reject(err);
	},
);

export default axiosClient;
