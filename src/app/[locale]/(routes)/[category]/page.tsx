import { ProductGrid } from "@/components/products/product-grid";
import { loadCategories } from "@/services/categories.service";
import { loadProductsByCategory } from "@/services/product.service";
import { formatUrlToDisplayName } from "@/utils/string-utils";
import { useLocale } from "next-intl";

interface Params {
	category: string;
}

export default function CategoryPageWrapper({ params }: { params: Params }) {
	const locale = useLocale();
	return (
		<CategoryPage
			params={params}
			locale={locale}
		/>
	);
}

async function CategoryPage({
	params,
	locale,
}: {
	params: Params;
	locale: string;
}) {
	const { category } = params;
	const formattedCategory = formatUrlToDisplayName(category);

	const categories = await loadCategories(locale);

	const categoryData = categories.find((cat: any) =>
		locale === "en"
			? cat.name_en.toLowerCase() === formattedCategory.toLowerCase()
			: cat.name_no.toLowerCase() === formattedCategory.toLowerCase(),
	);

	if (!categoryData) {
		return <div>Category not found</div>;
	}

	const products = await loadProductsByCategory(categoryData.group_id);

	return (
		<div className="py-8">
			<h1 className="mb-4 text-2xl font-bold">
				{locale === "en" ? categoryData.name_en : categoryData.name_no}
			</h1>
			<ProductGrid initialProducts={products} />
		</div>
	);
}
