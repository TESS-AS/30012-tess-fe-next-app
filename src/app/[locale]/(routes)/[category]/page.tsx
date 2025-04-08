import { ProductGrid } from "@/components/products/product-grid";
import { mockProducts } from "@/mocks/mockProducts";

interface Params {
	category: string;
}

export default async function CategoryPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { category } = await params;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 text-2xl font-bold capitalize">{category}</h1>
			<ProductGrid initialProducts={mockProducts} />
		</div>
	);
}
