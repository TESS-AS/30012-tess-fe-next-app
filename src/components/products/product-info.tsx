import { formatUrlToDisplayName } from "@/utils/string-utils";

interface ProductInfoProps {
    name: string;
    category: string;
    price?: number;
}

export function ProductInfo({ name, category, price }: ProductInfoProps) {
    return (
        <div>
            <p className="text-sm text-muted-foreground capitalize">
                {formatUrlToDisplayName(category)}
            </p>
            <h1 className="text-2xl font-bold mt-1">
                {name}
            </h1>
            {price && (
                <p className="text-primary text-xl font-semibold mt-2">
                    {price.toFixed(2)} EUR
                </p>
            )}
        </div>
    );
}
