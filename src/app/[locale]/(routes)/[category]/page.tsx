interface Params {
	category: string;
}

export default async function CategoryPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { category } = await params;
	return <h1>Category: {category}</h1>;
}
