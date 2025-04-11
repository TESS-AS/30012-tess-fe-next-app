import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosServer = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

export default axiosServer;
