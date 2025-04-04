interface Params {
	category: string;
	product: string;
}

export default async function ProductPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { category, product } = await params;
	return (
		<div>
			<h1>Category: {category}</h1>
			<h2>Product: {product}</h2>
		</div>
	);
}
