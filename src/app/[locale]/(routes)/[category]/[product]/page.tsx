interface Params {
	category: string;
	product: string;
}

export default async function ProductPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const resolvedParams = await params;
	return (
		<div>
			<h1>Category: {resolvedParams.category}</h1>
			<h2>Product: {resolvedParams.product}</h2>
		</div>
	);
}
