import { useMemo, useState } from "react";
import { useGetAssets } from "./useGetAssets";

type Status = "ok" | "warn" | "error";

export type ChildNode = {
	id: string;
	name: string;
	status: Status;
	children?: {
		id: string;
		name: string;
		status: Status;
	}[];
};

export type LocationNode = {
	id: string;
	name: string;
	status: Status;
	children?: ChildNode[];
};

export const useGetHoseSystems = () => {
	const [selectedS1Code] = useState<string | undefined>(undefined);

	const { loading, s1Codes = [] } = useGetAssets("", selectedS1Code, {
		initAssets: false,
		initS1Codes: true,
		s2Filter: true,
	});

	const locations: LocationNode[] = useMemo(() => {
		return (s1Codes || [])
			.filter((s1) => s1.S1Code && s1.S1Name)
			.map((s1: any) => ({
				id: String(s1.S1Id ?? s1.S1Code),
				name: String(s1.S1Name ?? s1.S1Code ?? "S1"),
				status: "ok" as Status,
				children: Array.isArray(s1.S2)
					? s1.S2.map((s2: any) => ({
							id: String(s2.S2Id ?? s2.S2Code),
							name: String(s2.S2Name ?? s2.S2Code ?? "S2"),
							status: "ok" as Status,
							children: [],
						}))
					: [],
			}));
	}, [s1Codes]);

	return {
		loading,
		locations,
		selectedS1Code,
	};
};
