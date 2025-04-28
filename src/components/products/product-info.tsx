import { formatUrlToDisplayName } from "@/lib/utils";

interface ProductInfoProps {
	name: string;
	category: string;
	price?: number;
}

export function ProductInfo({ name, category, price }: ProductInfoProps) {
	return (
		<div>
			<p className="text-muted-foreground text-sm capitalize">
				{formatUrlToDisplayName(category)}
			</p>
			<h1 className="mt-1 text-2xl font-bold">{name}</h1>
			{price && (
				<p className="text-primary mt-2 text-xl font-semibold">
					{price.toFixed(2)} EUR
				</p>
			)}
		</div>
	);
}
