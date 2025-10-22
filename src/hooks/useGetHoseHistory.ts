import { GetHoseHistory } from "@/types/assets.types";
import { useEffect, useState } from "react";
import { getHoseHistory } from "../services/assets.service";

export const useGetHoseHistory = (hexagonId: string) => {
	const [hoseHistory, setHoseHistory] = useState<GetHoseHistory | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!hexagonId) {
			setHoseHistory(null);
			return;
		}

		const loadHoseHistory = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await getHoseHistory(hexagonId);
				setHoseHistory(response);
			} catch (err: any) {
				const errorMessage =
					err?.response?.data?.message ||
					err?.message ||
					"Failed to load hose history";
				setError(new Error(errorMessage));
			} finally {
				setIsLoading(false);
			}
		};

		loadHoseHistory();
	}, [hexagonId]);

	return {
		hoseHistory,
		isLoading,
		error,
		setHoseHistory,
	};
};
