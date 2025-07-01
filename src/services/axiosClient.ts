import { baseURL, defaultHeaders } from "@/lib/axiosConfig";
import axios from "axios";

const axiosClient = axios.create({
	baseURL,
	withCredentials: true,
	headers: defaultHeaders,
});

axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			console.warn("Unauthorized - maybe session expired?");
		}
		return Promise.reject(error);
	},
);

export default axiosClient;
