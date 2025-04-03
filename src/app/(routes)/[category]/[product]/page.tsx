export default async function ProductPage({
	params,
}: {
	params: Promise<{ category: string; product: string }>;
}) {
	const { category, product } = await params;

	return (
		<div>
			<h1>Category: {category}</h1>
			<h2>Product: {product}</h2>
		</div>
	);
}
