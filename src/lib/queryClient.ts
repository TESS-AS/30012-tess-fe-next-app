import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1 * 60 * 1000,
			gcTime: 2 * 60 * 1000, // Reduced from 5 to 2 minutes to prevent cache accumulation
			retry: 1,
			refetchOnWindowFocus: false,
			// Prevent excessive cache growth
			structuralSharing: true,
		},
	},
});
