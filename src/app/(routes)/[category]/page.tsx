import ProductFilter from "@/app/components/Filter.component";

export default async function CategoryPage({
	params,
}: {
	params: Promise<{ category: string }>;
}) {
	const { category } = await params;

	return (
		<div>
			<ProductFilter />
			<h1>Category: {category}</h1>
		</div>
	);
}
