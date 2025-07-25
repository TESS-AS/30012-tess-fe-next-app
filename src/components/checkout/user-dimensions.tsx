import { useState, useEffect, useRef } from "react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { getUserDimensions } from "@/services/dimensions.service";
import { UserDimensionItem } from "@/types/dimensions.types";
import { Order } from "@/types/orders.types";
import { formatUserDimensionsToHierarchy } from "@/utils/dimensionFormaters";

import { DimensionSearchInput } from "./dimension-search-input";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "../ui/select";

interface Props {
	orderData: Order;
	setOrderData: (data: (prev: Order) => Order) => void;
	dimensionInputMode: "select" | "search" | "manual";
	setDimensionInputMode: (mode: "select" | "search" | "manual") => void;
}

export const UserDimensionsInput: React.FC<Props> = ({
	orderData,
	setOrderData,
	dimensionInputMode,
	setDimensionInputMode,
}) => {
	const [userDimensions, setUserDimensions] = useState<UserDimensionItem[]>([]);
	const [userDimension, setUserDimension] = useState("");
	const [userDimensionOne, setUserDimensionOne] = useState("");
	const [userDimensionTwo, setUserDimensionTwo] = useState("");
	const [userDimensionThree, setUserDimensionThree] = useState("");
	const [activeDimension, setActiveDimension] = useState<number | null>(null);

	const userDimensionsRef = useClickOutside<HTMLDivElement>(() => {
		setUserDimensionOne("");
		setUserDimensionTwo("");
		setUserDimensionThree("");
		setActiveDimension(null);
	});

	useEffect(() => {
		const dimensionSelectString = [
			orderData.salesOrderHeader.customersOrderReference,
			orderData.salesOrderHeader.customerReference,
			orderData.salesOrderLines?.[0]?.accountPart3,
		]
			.filter(Boolean)
			.join("<");

		setUserDimension(dimensionSelectString);
		setUserDimensionOne(
			orderData.salesOrderHeader.customersOrderReference || "",
		);
		setUserDimensionTwo(orderData.salesOrderHeader.customerReference || "");
		setUserDimensionThree(orderData.salesOrderLines?.[0]?.accountPart3 || "");
	}, [orderData]);

	useEffect(() => {
		const loadDimensions = async () => {
			const dims = await getUserDimensions();
			setUserDimensions(dims);
		};
		loadDimensions();
	}, []);

	useEffect(() => {
		setUserDimension("");
		setUserDimensionOne("");
		setUserDimensionTwo("");
		setUserDimensionThree("");
		setActiveDimension(null);
	}, [dimensionInputMode]);

	const updateOrderData = (parts: string[]) => {
		setOrderData((prev: Order) => {
			const updated = { ...prev };
			if (parts.length === 1) {
				updated.salesOrderHeader.customersOrderReference = parts[0];
			} else if (parts.length === 2) {
				updated.salesOrderHeader.customersOrderReference = parts[0];
				updated.salesOrderHeader.customerReference = parts[1];
			} else if (parts.length === 3) {
				updated.salesOrderHeader.customersOrderReference = parts[0];
				updated.salesOrderHeader.customerReference = parts[1];
				updated.salesOrderLines = updated.salesOrderLines.map((line) => ({
					...line,
					accountPart3: parts[2],
				}));
			}
			return updated;
		});
	};

	return (
		<div className="space-y-4">
			<div className="mb-4 flex items-center gap-4">
				<Label className="text-sm">User Dimension Input:</Label>
				<RadioGroup
					defaultValue={dimensionInputMode}
					onValueChange={(value) => setDimensionInputMode(value as any)}
					className="flex items-center gap-4">
					<div className="flex items-center gap-1">
						<RadioGroupItem
							value="select"
							id="select"
						/>
						<Label htmlFor="select">Select</Label>
					</div>
					<div className="flex items-center gap-1">
						<RadioGroupItem
							value="search"
							id="search"
						/>
						<Label htmlFor="search">Search</Label>
					</div>
					<div className="flex items-center gap-1">
						<RadioGroupItem
							value="manual"
							id="manual"
						/>
						<Label htmlFor="manual">Manual</Label>
					</div>
				</RadioGroup>
			</div>

			{dimensionInputMode === "select" && (
				<>
					<Label>User Dimensions</Label>
					<Select
						value={userDimension}
						onValueChange={(value) => {
							const parts = value.split("<");
							setUserDimension(value);
							updateOrderData(parts);
						}}>
						<SelectTrigger>
							<SelectValue placeholder="Select User Dimension" />
						</SelectTrigger>
						<SelectContent>
							{formatUserDimensionsToHierarchy(userDimensions).map(
								(dim, index) => (
									<SelectItem
										key={`${dim.value}-${index}`}
										value={dim.value}>
										{dim.label}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</>
			)}

			{dimensionInputMode === "search" && (
				<div ref={userDimensionsRef}>
					<DimensionSearchInput
						level={1}
						value={userDimensionOne}
						onChange={(value) => {
							setUserDimensionOne(value);
							setActiveDimension(value ? 1 : null);
						}}
						placeholder="User Dimension 1"
						onSelect={(dim) => {
							setUserDimensionOne(dim.dimensionName);
							setActiveDimension(null);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customersOrderReference: dim.customerNumber,
								},
							}));
						}}
						isVisible={activeDimension === null || activeDimension === 1}
					/>

					<DimensionSearchInput
						level={2}
						value={userDimensionTwo}
						onChange={(value) => {
							setUserDimensionTwo(value);
							setActiveDimension(value ? 2 : null);
						}}
						placeholder="User Dimension 2"
						onSelect={(dim) => {
							setUserDimensionTwo(dim.dimensionName);
							setActiveDimension(null);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customerReference: dim.customerNumber,
								},
							}));
						}}
						isVisible={activeDimension === null || activeDimension === 2}
					/>

					<DimensionSearchInput
						level={3}
						value={userDimensionThree}
						onChange={(value) => {
							setUserDimensionThree(value);
							setActiveDimension(value ? 3 : null);
						}}
						placeholder="User Dimension 3"
						onSelect={(dim) => {
							setUserDimensionThree(dim.dimensionName);
							setActiveDimension(null);
							setOrderData((prev) => ({
								...prev,
								salesOrderLines: prev.salesOrderLines.map((line) => ({
									...line,
									accountPart3: dim.customerNumber,
								})),
							}));
						}}
						isVisible={activeDimension === null || activeDimension === 3}
					/>
				</div>
			)}

			{dimensionInputMode === "manual" && (
				<>
					<Input
						type="text"
						placeholder="User Dimension 1"
						value={userDimension}
						onChange={(e) => {
							setUserDimension(e.target.value);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customersOrderReference: e.target.value,
								},
							}));
						}}
					/>
					<Input
						type="text"
						placeholder="User Dimension 2"
						value={userDimensionTwo}
						onChange={(e) => {
							setUserDimensionTwo(e.target.value);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customerReference: e.target.value,
								},
							}));
						}}
					/>
					<Input
						type="text"
						placeholder="User Dimension 3"
						value={userDimensionThree}
						onChange={(e) => {
							setUserDimensionThree(e.target.value);
							setOrderData((prev) => ({
								...prev,
								salesOrderLines: prev.salesOrderLines.map((line) => ({
									...line,
									accountPart3: e.target.value,
								})),
							}));
						}}
					/>
				</>
			)}
		</div>
	);
};
