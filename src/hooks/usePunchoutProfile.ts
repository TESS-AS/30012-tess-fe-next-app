import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";

let refetchTrigger = 0;
const listeners = new Set<() => void>();
const clearListeners = new Set<() => void>();

export const triggerProfileRefetch = () => {
	refetchTrigger++;
	listeners.forEach((listener) => listener());
};

export const clearPunchoutProfile = () => {
	clearListeners.forEach((listener) => listener());
};

export function usePunchoutProfile() {
	const [data, setData] = useState<ProfileUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<unknown>(null);
	const [trigger, setTrigger] = useState(0);

	useEffect(() => {
		const listener = () => setTrigger((prev) => prev + 1);
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}, []);

	useEffect(() => {
		const clearListener = () => {
			setData(null);
			setIsLoading(true);
		};
		clearListeners.add(clearListener);
		return () => {
			clearListeners.delete(clearListener);
		};
	}, []);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get<ProfileUser[]>("/user");
				setData(response.data[0]);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchUserData();
	}, [trigger]);

	return { data, isLoading, error };
}
