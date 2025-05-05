"use client";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface ProductVariant {
	thread: string;
	length: string;
	coating: string;
	quantity?: number;
}

interface ProductVariantTableProps {
	variants: ProductVariant[];
	onAddVariant?: (variant: ProductVariant) => void;
	onQuantityChange?: (variant: ProductVariant, quantity: number) => void;
}

export default function ProductVariantTable({
	variants,
	onAddVariant,
	onQuantityChange,
}: ProductVariantTableProps) {
	return (
		<div className="mt-4">
			<Table className="rounded-md border">
				<TableHeader className="bg-muted text-muted-foreground">
					<TableRow>
						<TableHead>Thread Size</TableHead>
						<TableHead>Length</TableHead>
						<TableHead>Coating</TableHead>
						<TableHead>Qty</TableHead>
						<TableHead className="w-[100px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{variants.map((variant, i) => (
						<TableRow
							key={`${variant.thread}-${variant.length}-${variant.coating}-${i}`}>
							<TableCell>{variant.thread}</TableCell>
							<TableCell>{variant.length}</TableCell>
							<TableCell>{variant.coating}</TableCell>
							<TableCell>
								<input
									type="number"
									min="1"
									value={variant.quantity || 1}
									onChange={(e) =>
										onQuantityChange?.(variant, parseInt(e.target.value))
									}
									className="w-16 rounded-md border px-2 py-1"
								/>
							</TableCell>
							<TableCell>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onAddVariant?.(variant)}
									className="text-primary hover:text-primary/80">
									Add
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
