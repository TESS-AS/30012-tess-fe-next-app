import axios from "axios";
import { baseURL } from "@/lib/axiosConfig";

const axiosServer = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export default axiosServer;
