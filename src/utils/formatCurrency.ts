export const formatNorwegianCurrency = (amount: number): string => {
	return (
		new Intl.NumberFormat("nb-NO", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			useGrouping: true,
		}).format(amount) + " kr"
	);
};
