import { ProductGrid } from "@/components/products/product-grid";
import { mockProducts } from "@/mocks/mockProducts";

export default async function SubCategoryPage({
	params,
}: {
	params: Promise<{ subcategory: string }>;
}) {
	const { subcategory } = await params;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 text-2xl font-bold capitalize">{subcategory}</h1>
			<ProductGrid initialProducts={mockProducts} />
		</div>
	);
}
