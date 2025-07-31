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

export function extractUniqueDimensions(
	dimensions: UserDimensionItem[]
): {
	dimension1Options: { label: string; value: string }[];
	dimension2Options: { label: string; value: string }[];
	dimension3Options: { label: string; value: string }[];
} {
	const dim1Map = new Map<string, string>();
	const dim2Map = new Map<string, string>();
	const dim3Map = new Map<string, string>();

	for (const item of dimensions) {
		const { dimension1, dimension2, dimension3 } = item.hierarchy;

		if (dimension1?.name && dimension1?.label)
			dim1Map.set(dimension1.name, dimension1.label);
		if (dimension2?.name && dimension2?.label)
			dim2Map.set(dimension2.name, dimension2.label);
		if (dimension3?.name && dimension3?.label)
			dim3Map.set(dimension3.name, dimension3.label);
	}

	const toArray = (map: Map<string, string>) =>
		Array.from(map.entries()).map(([value, label]) => ({ value, label }));

	return {
		dimension1Options: toArray(dim1Map),
		dimension2Options: toArray(dim2Map),
		dimension3Options: toArray(dim3Map),
	};
}
