import CategoryContent from "@/components/category/category-content";
import { ProductGrid } from "@/components/products/product-grid";
import { mockProducts } from "@/mocks/mockProducts";

export default async function SubCategoryPage({
	params,
}: {
	params: Promise<{ subcategory: string }>;
}) {
	const { subcategory } = await params;

	return <CategoryContent category={subcategory} />;
}
