import type { ReactNode } from "react";

export type InfoItem = {
	q: string;
	a: ReactNode;
};

export type FaqCategory = {
	number: number;
	title: string;
	items: InfoItem[];
};
