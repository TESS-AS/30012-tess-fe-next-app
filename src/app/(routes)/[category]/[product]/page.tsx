export default function ProductPage({ params }) {
	return (
		<div>
			<h1>Category: {params.category}</h1>
			<h2>Product: {params.product}</h2>
		</div>
	);
}
