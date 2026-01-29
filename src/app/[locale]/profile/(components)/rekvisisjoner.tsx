import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useRequisitions } from "@/hooks/useRequisitions";
import { cn, formatDate } from "@/lib/utils";
import { addToCart } from "@/services/carts.service";
import { updateRequisition } from "@/services/requisitions.service";
import { Label } from "@radix-ui/react-label";
import {
	Search,
	ChevronDown as ChevronDownIcon,
	CircleX,
	CircleCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { getStatusIcons } from "./mine-bestillinger";

type Status = "Alle" | "Venter godkjenning" | "Godkjent" | "Avvist";

const statuses: Status[] = ["Alle", "Venter godkjenning", "Godkjent", "Avvist"];

const getStatusCount = (status: Status, rekvisisjoner: Rekvisisjon[]) => {
	if (status === "Alle") return rekvisisjoner.length;
	return rekvisisjoner.filter((r) => r.status === status).length;
};

interface OrderItem {
	name: string;
	sku: string;
	quantity: number;
	price: string;
	productNumber: string;
	itemNumber: string;
}

interface Rekvisisjon {
	requisitionId: number;
	requestDate: string;
	requestTime: string;
	orderId: string;
	bestiller: string;
	opprettet: string;
	pris: string;
	status: Status;
	items: OrderItem[];
}

export const getStatusChipColor = (status: string) => {
	switch (status) {
		case "Godkjent":
			return "bg-[#DCF7E0] text-[#005522]";
		case "Venter godkjenning":
			return "bg-[#FDF6B2] text-[#723B13]";
		case "Avvist":
			return "bg-[#FDE8E8] text-[#9B1C1C]";
		default:
			return "bg-gray-100 text-gray-600";
	}
};

export function Rekvisisjoner() {
	const t = useTranslations("Rekvisisjoner");
	const router = useRouter();
	const { data: profile } = usePunchoutProfile();
	const isCustomerRole = (profile?.role ?? "").toLowerCase() === "customer";

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
	const [currentPage, setCurrentPage] = useState(1);
	const [approvalModalOpen, setApprovalModalOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Rekvisisjon | null>(null);
	const [showAllItems, setShowAllItems] = useState(false);
	const [allRequisitionsCache, setAllRequisitionsCache] = useState<
		Rekvisisjon[]
	>([]);

	const { requisitions, loading, error, getRequisitions } = useRequisitions(
		profile?.defaultCustomerNumber ?? "",
		selectedStatus,
	);

	// Cache all requisitions when "Alle" is selected for accurate counts
	useEffect(() => {
		if (selectedStatus === "Alle" && requisitions.length > 0) {
			setAllRequisitionsCache(requisitions);
		}
	}, [selectedStatus, requisitions]);

	const getRadioStatusStyle = (status: Status) => {
		switch (status) {
			case "Venter godkjenning":
				return "bg-[#C27803]";
			case "Godkjent":
				return "bg-[#1C6D2C]";
			case "Avvist":
				return "bg-[#9B1C1C]";
			default:
				return "bg-gray-100";
		}
	};

	const filteredRekvisisjoner = requisitions.filter((rekvisisjon) => {
		const matchesSearch =
			rekvisisjon.requisitionId
				.toString()
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			rekvisisjon.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedStatus]);

	const itemsPerPage = 10;
	const totalItems = filteredRekvisisjoner.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const pagedRekvisisjoner = filteredRekvisisjoner.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const columns = [
		{
			key: "orderId",
			header: t("orderId").toUpperCase(),
			cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.orderId,
		},
		{
			key: "bestiller",
			header: t("orderer").toUpperCase(),
			cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.bestiller,
		},
		{
			key: "opprettet",
			header: t("created").toUpperCase(),
			cell: (rekvisisjon: Rekvisisjon) =>
				formatDate(rekvisisjon.requestDate, rekvisisjon.requestTime),
		},
		{
			key: "pris",
			header: t("price").toUpperCase(),
			cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.pris,
		},
		{
			key: "status",
			header: t("status").toUpperCase(),
			cell: (rekvisisjon: Rekvisisjon) => (
				<div
					className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${getStatusChipColor(rekvisisjon.status)}`}>
					{getStatusIcons(rekvisisjon.status)}
					<span>{rekvisisjon.status}</span>
				</div>
			),
		},
		{
			key: "actions",
			header: "",
			cell: (rekvisisjon: Rekvisisjon) => (
				<div className="flex justify-end gap-2">
					{rekvisisjon.status === "Venter godkjenning" && (
						<>
							<Button
								variant="outline"
								size="sm"
								disabled={isCustomerRole}
								className="border-[#009640] text-[#009640] hover:border-[#005522] hover:bg-[#005522] hover:text-white"
								onClick={async () => {
									setSelectedOrder(rekvisisjon);
									setShowAllItems(false);
									setApprovalModalOpen(true);
									try {
										await updateRequisition({
											customerNumber:
												profile?.defaultCustomerNumber?.toString() ?? "",
											requisitionId: rekvisisjon.requisitionId,
											status: "approved",
										});
										await Promise.all(
											rekvisisjon.items.map((item) =>
												addToCart({
													productNumber: item.productNumber,
													itemNumber: item.itemNumber,
													quantity: item.quantity,
													warehouseNumber: "1",
													companyNumber:
														profile?.defaultCompanyNumber?.toString() || "1",
												}),
											),
										);
										getRequisitions();
									} catch (error) {
										console.error(
											"Error approving requisition and adding items to cart",
											error,
										);
									}
								}}>
								{t("approve")}
								<CircleCheck />
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={isCustomerRole}
								className="border-[#C81E1E] text-[#C81E1E] hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-white"
								onClick={async () => {
									try {
										await updateRequisition({
											customerNumber:
												profile?.defaultCustomerNumber?.toString() ?? "",
											requisitionId: rekvisisjon.requisitionId,
											status: "rejected",
										});
										getRequisitions();
									} catch (error) {
										console.error(
											"Error updating requisition status to rejected",
											error,
										);
									}
								}}>
								{t("reject")}
								<CircleX />
							</Button>
						</>
					)}
					{rekvisisjon.status === "Avvist" && (
						<Button
							variant="outline"
							size="sm"
							disabled={isCustomerRole}
							className="border-[#C1C4C2] text-[#0F1912] hover:bg-[#E8EAE9] hover:text-[#009640]"
							onClick={async () => {
								if (isCustomerRole) return;
								try {
									await updateRequisition({
										customerNumber:
											profile?.defaultCustomerNumber?.toString() ?? "",
										requisitionId: rekvisisjon.requisitionId,
										status: "awaiting",
									});
									getRequisitions();
								} catch (error) {
									console.error(
										"Error updating requisition status to awaiting",
										error,
									);
								}
							}}>
							{t("restore")}
						</Button>
					)}
				</div>
			),
		},
	];
	return (
		<div className="space-y-6">
			<div className="flex items-baseline justify-between">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">{t("title")}</h1>
					<p className="ml-4 text-[#5A615D]">{t("subtitle")}</p>
				</div>
			</div>

			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="space-y-6 p-6">
					<div className="relative flex w-full max-w-[480px]">
						<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#5A615D]" />
						<Input
							placeholder={t("searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="font-sm h-10 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-24 pl-12 text-base text-[#5A615D]"
						/>
						<Button
							type="submit"
							className="absolute top-1/2 right-0 h-10 -translate-y-1/2 rounded-none rounded-r-md border-1 border-l-2 border-[#8A8F8C] bg-white px-4 font-medium text-[#0F1912] hover:bg-white">
							{t("search")}
						</Button>
					</div>
					<div className="flex items-center gap-3 border-t border-[#C1C4C2] pt-6">
						<p className="text-sm font-bold text-[#0F1912]">{t("status")}:</p>
						<RadioGroup
							value={selectedStatus}
							onValueChange={setSelectedStatus}
							className="flex flex-wrap gap-3">
							{statuses.map((status) => {
								const dataForCount =
									allRequisitionsCache.length > 0
										? allRequisitionsCache
										: requisitions;
								const count = getStatusCount(status, dataForCount);
								const badgeStyle = getRadioStatusStyle(status);
								return (
									<div
										key={status}
										className="flex items-center">
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value={status}
												id={status}
												className={cn(
													"h-5 w-5",
													selectedStatus === status
														? "border-[#1C6D2C] text-[#1C6D2C]"
														: "border-[#C1C4C2]",
												)}
											/>
											<Label
												htmlFor={status}
												className={cn("text-sm font-medium text-[#0F1912]")}>
												{status}
											</Label>
										</div>
										{status !== "Alle" && count > 0 && (
											<span
												className={cn(
													"ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white",
													badgeStyle,
												)}>
												{count}
											</span>
										)}
									</div>
								);
							})}
						</RadioGroup>
					</div>
				</div>

				<DataTable
					data={pagedRekvisisjoner}
					columns={columns}
					currentPage={currentPage}
					itemsPerPage={itemsPerPage}
					totalItems={totalItems}
					onPageChange={setCurrentPage}
					isLoading={loading}
					isExpandable
					expandableContent={(rekvisisjon) => {
						return (
							<div>
								<table className="w-[70%]">
									<thead>
										<tr>
											<th className="w-[60%] pb-4 text-left text-xs font-bold text-[#5A615D]">
												{t("units").toUpperCase()}
											</th>
											<th className="w-[20%] pb-4 text-left text-xs font-bold text-[#5A615D]">
												{t("quantity").toUpperCase()}
											</th>
											<th className="w-[20%] pb-4 text-left text-xs font-bold text-[#5A615D]">
												{t("price").toUpperCase()}
											</th>
										</tr>
									</thead>
									<tbody className="text-sm">
										{rekvisisjon.items.map((item, index) => (
											<tr
												key={index}
												className="border-t border-[#E5E7E6]">
												<td className="py-4">
													<div className="space-y-1">
														<p className="font-medium text-[#0F1912]">
															{item.name}
														</p>
														<p className="text-[#5A615D]">{item.itemNumber}</p>
													</div>
												</td>
												<td className="py-4">{item.quantity}</td>
												<td className="py-4">{item.price}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						);
					}}
					totalPages={totalPages}
					isDropdownColumn
				/>
			</div>

			<Modal
				className="max-w-[400px]"
				open={approvalModalOpen}
				onOpenChange={setApprovalModalOpen}>
				<div>
					<ModalHeader>
						<ModalTitle className="flex items-center gap-2">
							<Image
								src="/icons/check-filled.svg"
								alt="Check"
								width={20}
								height={20}
							/>
							<span>
								{t("itemsAddedToCart", {
									count: selectedOrder?.items?.length || 0,
								})}
							</span>
						</ModalTitle>
					</ModalHeader>
					<div className="space-y-2 py-4">
						{selectedOrder?.items
							?.slice(0, showAllItems ? undefined : 5)
							.map((item, index) => (
								<div
									key={index}
									className="text-sm text-gray-600">
									1 × {item.sku}
								</div>
							))}
						{selectedOrder?.items && selectedOrder.items.length > 5 && (
							<button
								onClick={() => setShowAllItems(!showAllItems)}
								className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
								{showAllItems ? (
									<>
										{t("showLess")}{" "}
										<ChevronDownIcon className="h-4 w-4 rotate-180 transform" />
									</>
								) : (
									<>
										{t("showAll")} <ChevronDownIcon className="h-4 w-4" />
									</>
								)}
							</button>
						)}
					</div>
					<div className="flex">
						<Button
							variant="default"
							className="w-full bg-[#1C6D2C] text-white hover:bg-[#164B1F]"
							onClick={async () => {
								setApprovalModalOpen(false);

								// const response = await addToCart({
								// 	productNumber: selectedOrder?.items[0].itemNumber,
								// 	itemNumber: selectedOrder?.items[0].itemNumber,
								// 	quantity: selectedOrder?.items[0].quantity,
								// 	warehouseNumber: selectedOrder?.items[0].warehouseNumber,
								// 	companyNumber:
								// 		profile?.defaultCompanyNumber.toString() || "1",
								// });
								router.push("/cart");
							}}>
							{t("goToCart")}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
