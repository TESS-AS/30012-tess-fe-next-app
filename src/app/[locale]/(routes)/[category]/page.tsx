interface Params {
	category: string;
}

export default async function CategoryPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const resolvedParams = await params;
	return <h1>Category: {resolvedParams.category}</h1>;
}
