import {
	CustomerDimensionItem,
	UserDimensionItem,
} from "@/types/dimensions.types";

export function formatCustomerDimensionsToHierarchy(
	dimensions: CustomerDimensionItem[],
): Array<{ label: string; value: string }> {
	return dimensions.flatMap((dim) => {
		const results = [{ label: dim.d1_name, value: dim.d1_name }];

		if (dim.d2_name) {
			results.push({
				label: `${dim.d1_name}<${dim.d2_name}`,
				value: `${dim.d1_name}<${dim.d2_name}`,
			});
		}

		if (dim.d3_name) {
			results.push({
				label: `${dim.d1_name}<${dim.d2_name}<${dim.d3_name}`,
				value: `${dim.d1_name}<${dim.d2_name}<${dim.d3_name}`,
			});
		}

		return results;
	});
}

export function formatUserDimensionsToHierarchy(
	dimensions: UserDimensionItem[],
): Array<{ label: string; value: string }> {
	const uniqueValues = new Set<string>();

	const results = dimensions.flatMap((dim) => {
		const results = [];
		if (!uniqueValues.has(dim.dimension1.label)) {
			uniqueValues.add(dim.dimension1.label);
			results.push({
				label: dim.dimension1.label,
				value: dim.dimension1.label,
			});
		}

		if (dim.dimension2.label) {
			const value = `${dim.dimension1.label}<${dim.dimension2.label}`;
			if (!uniqueValues.has(value)) {
				uniqueValues.add(value);
				results.push({
					label: value,
					value: value,
				});
			}
		}

		if (dim.dimension3.label) {
			const value = `${dim.dimension1.label}<${dim.dimension2.label}<${dim.dimension3.label}`;
			if (!uniqueValues.has(value)) {
				uniqueValues.add(value);
				results.push({
					label: value,
					value: value,
				});
			}
		}

		return results;
	});

	return results;
}
