import { useEffect, useState } from "react";

import { OrderItems } from "@/types/orders.types";

const ALL_ORDERS: OrderItems[] = [
	{
		id: 440765,
		date: "2024-10-29",
		status: "Completed",
		total: 14.5,
		items: [{ imageUrl: "../../../images/gloves.jpg" }],
	},
	{
		id: 437919,
		date: "2024-10-21",
		status: "Cancelled",
		total: 178.5,
		items: [{ imageUrl: "../../../images/helmet.jpg" }],
	},
	{
		id: 384924,
		date: "2024-02-09",
		status: "Completed",
		total: 208,
		items: [
			{ imageUrl: "../../../images/gloves.jpg" },
			{ imageUrl: "../../../images/gloves.jpg" },
		],
	},
];

export function useGetOrders(page: number, perPage: number = 3) {
	const [data, setData] = useState<OrderItems[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		const timeout = setTimeout(() => {
			const start = (page - 1) * perPage;
			const end = start + perPage;
			setData(ALL_ORDERS.slice(start, end));
			setIsLoading(false);
		}, 300);
		return () => clearTimeout(timeout);
	}, [page, perPage]);

	return {
		data,
		isLoading,
		totalPages: Math.ceil(ALL_ORDERS.length / perPage),
	};
}
