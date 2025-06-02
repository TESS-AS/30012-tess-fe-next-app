import { baseURL } from "@/lib/axiosConfig";
import axios from "axios";

const axiosServer = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export default axiosServer;
