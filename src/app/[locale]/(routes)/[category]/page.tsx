import CategoryContent from "../../../../components/category/category-content";

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
		<CategoryContent
			category={category}
			isCategoryPage
		/>
	);
}
