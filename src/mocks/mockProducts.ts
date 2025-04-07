export interface Product {
	id: string;
	name: string;
	price: number;
	image: string;
	category: string;
}

export const mockProducts: Product[] = [
	{
		id: "1",
		name: "Product 1",
		price: 99.99,
		image: "/images/product1.jpg",
		category: "category1",
	},
	{
		id: "2",
		name: "Product 2",
		price: 149.99,
		image: "/images/product2.jpg",
		category: "category1",
	},
];
