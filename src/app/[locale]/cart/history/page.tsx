

'use client';

import { useEffect, useState } from 'react';
import { getArchiveCart } from '@/services/carts.service';
import { ArchiveCartResponse } from '@/types/carts.types';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const CartHistoryPage = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [archiveData, setArchiveData] = useState<ArchiveCartResponse>();
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

	const fetchArchiveData = async (page: number) => {
		setIsLoading(true);
		try {
			const data = await getArchiveCart(page);
			setArchiveData(data);
		} catch (error) {
			console.error('Error fetching archive data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchArchiveData(currentPage);
	}, [currentPage]);

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	return (
		<div className="container py-10">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Cart History</h1>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>User Id</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{archiveData?.data.map((item, idx) => {
								const total = item.cart.reduce(
									(acc, cartItem) =>
										acc + (cartItem.price || 0) * cartItem.quantity,
									0,
								);

								return (
                                    <div key={idx}>
									<TableRow key={idx}>
										<TableCell>
											{format(
												new Date(item.date),
												'MMM dd, yyyy HH:mm',
											)}
										</TableCell>
										<TableCell>
											{item.userId}
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												onClick={() => setExpandedRow(idx)}>
												View
											</Button>
										</TableCell>
									</TableRow>
                                    {expandedRow === idx && (
                                        <TableRow> 
                                            <TableCell colSpan={4}>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Product Number</TableHead>
                                                            <TableHead>Item Number</TableHead>
                                                            <TableHead>Quantity</TableHead>
                                                            <TableHead>Warehouse Number</TableHead>
                                                            <TableHead>Company Number</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {item.cart.map((cartItem, idx) => {
                                                            return (
                                                                <TableRow key={idx}>
                                                                    <TableCell>
                                                                        {cartItem.productNumber}
                                                                    </TableCell>
                                                                    <TableCell>{cartItem.itemNumber}</TableCell>
                                                                    <TableCell>{cartItem.quantity}</TableCell>
                                                                    <TableCell>{cartItem.warehouseNumber}</TableCell>
                                                                    <TableCell>{cartItem.companyNumber}</TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    </div>
								);
							})}
						</TableBody>
					</Table>

					{/* Pagination */}
					<div className="mt-4 flex items-center justify-end space-x-2">
						<Button
							variant="outline"
							size="icon"
							disabled={currentPage === 1}
							onClick={() => handlePageChange(currentPage - 1)}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-sm text-muted-foreground">
							Page {currentPage} of {archiveData?.totalPages || 1}
						</span>
						<Button
							variant="outline"
							size="icon"
							disabled={
								currentPage === (archiveData?.totalPages || 1)
							}
							onClick={() => handlePageChange(currentPage + 1)}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default CartHistoryPage;