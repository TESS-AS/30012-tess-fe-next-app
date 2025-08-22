import { FileText } from "lucide-react";

interface ProductInfoProps {
	name: string;
	category: string;
	price?: number;
	pdfUrl?: string;
}

export function ProductInfo({ name, price, pdfUrl }: ProductInfoProps) {
	return (
		<div>
			<div className="mt-1 flex items-center justify-between">
				<h1 className="text-2xl font-semibold">{name}</h1>
				<a
					target="_blank"
					rel="noopener noreferrer"
					className="text-green-700 hover:text-green-900">
					<FileText className="h-6 w-6" />
				</a>
			</div>

			{price && (
				<p className="text-primary mt-2 text-xl font-semibold">
					{price.toFixed(2)} EUR
				</p>
			)}
		</div>
	);
}
