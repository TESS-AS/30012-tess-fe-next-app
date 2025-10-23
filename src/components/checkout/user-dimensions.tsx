import { useState, useEffect } from "react";

import { getUserDimensions } from "@/services/dimensions.service";
import { UserDimensionItem } from "@/types/dimensions.types";
import { Order } from "@/types/orders.types";
import { extractUniqueDimensions } from "@/utils/dimensionFormaters";
import { useTranslations } from "next-intl";

import { DimensionSearchInput } from "./dimension-search-input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "../ui/select";
import { Input } from "../ui/input";

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
	const t = useTranslations("Checkout.dimensions");
	const [userDimensions, setUserDimensions] = useState<UserDimensionItem[]>([]);
	const [userDimension, setUserDimension] = useState("");
	const [userDimensionOne, setUserDimensionOne] = useState("");
	const [userDimensionTwo, setUserDimensionTwo] = useState("");
	const [userDimensionThree, setUserDimensionThree] = useState("");
	const [userDimensionOneId, setUserDimensionOneId] = useState("");
	const [userDimensionTwoId, setUserDimensionTwoId] = useState("");
	const [userDimensionThreeId, setUserDimensionThreeId] = useState("");
	const [activeDimension, setActiveDimension] = useState<number | null>(null);
	const [dimension1Options, setDimension1Options] = useState<
		{ label: string; value: string }[]
	>([]);
	const [dimension2Options, setDimension2Options] = useState<
		{ label: string; value: string }[]
	>([]);
	const [dimension3Options, setDimension3Options] = useState<
		{ label: string; value: string }[]
	>([]);

	useEffect(() => {
		const prevMode = localStorage.getItem("prevDimensionMode");
		if (!prevMode || prevMode === dimensionInputMode) {
			if (dimensionInputMode === "select") {
				const dimensionSelectString = [
					orderData.salesOrderHeader.customersOrderReference,
					orderData.salesOrderHeader.customerReference,
					orderData.salesOrderLines?.[0]?.accountPart3,
				]
					.filter(Boolean)
					.join("<");

				setUserDimension(dimensionSelectString);
			}
			setUserDimensionOne(
				orderData.salesOrderHeader.customersOrderReference || "",
			);
			setUserDimensionTwo(orderData.salesOrderHeader.customerReference || "");
			setUserDimensionThree(orderData.salesOrderLines?.[0]?.accountPart3 || "");
		}
	}, [orderData, dimensionInputMode]);

	useEffect(() => {
		const prevMode = localStorage.getItem("prevDimensionMode");
		if (prevMode && prevMode !== dimensionInputMode) {
			setUserDimension("");
			setUserDimensionOne("");
			setUserDimensionTwo("");
			setUserDimensionThree("");
			setActiveDimension(null);
			setOrderData((prev: Order) => {
				const updated = { ...prev };
				updated.salesOrderHeader.customersOrderReference = "";
				updated.salesOrderHeader.customersOrderReference = "";
				updated.salesOrderHeader.customerReference = "";
				updated.salesOrderLines = updated.salesOrderLines.map((line) => ({
					...line,
					accountPart3: "",
				}));
				return updated;
			});
		}
		localStorage.setItem("prevDimensionMode", dimensionInputMode);
	}, [dimensionInputMode]);

	useEffect(() => {
		const loadDimensions = async () => {
			const dims = await getUserDimensions();
			setUserDimensions(dims ?? []);

			const { dimension1Options, dimension2Options, dimension3Options } =
				extractUniqueDimensions(dims ?? []);
			setDimension1Options(dimension1Options);
			setDimension2Options(dimension2Options);
			setDimension3Options(dimension3Options);
		};
		loadDimensions();
	}, []);

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
				{/* <Label className="text-sm">{t("label")}</Label> */}
				<RadioGroup
					defaultValue={dimensionInputMode}
					onValueChange={(value) => setDimensionInputMode(value as any)}
					className="flex items-center gap-4">
					<div className="flex items-center gap-1">
						<RadioGroupItem
							value="select"
							id="select"
						/>
						<Label htmlFor="select">{t("modes.select")}</Label>
					</div>
					<div className="flex items-center gap-1">
						<RadioGroupItem
							value="search"
							id="search"
						/>
						<Label htmlFor="search">{t("modes.search")}</Label>
					</div>
					<div className="flex items-center gap-1">
						<RadioGroupItem
							value="manual"
							id="manual"
						/>
						<Label htmlFor="manual">{t("modes.manual")}</Label>
					</div>
				</RadioGroup>
			</div>

			{dimensionInputMode === "select" && (
				<>
					<Label>{dimension1Options?.[0]?.label || t("dimension1")}</Label>
					<Select
						value={userDimensionOne}
						onValueChange={(value) => {
							setUserDimensionOne(value);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customersOrderReference: value,
								},
							}));
						}}>
						<SelectTrigger>
							<SelectValue
								placeholder={
									t("selectPlaceholder") +
									" " +
									(dimension1Options?.[0]?.label ?? t("reference"))
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{dimension1Options.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}>
									{/* {opt.label} -  */}
									{opt.value}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Label>{dimension2Options?.[0]?.label || t("dimension2")}</Label>
					<Select
						value={userDimensionTwo}
						onValueChange={(value) => {
							setUserDimensionTwo(value);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customerReference: value,
								},
							}));
						}}>
						<SelectTrigger>
							<SelectValue
								placeholder={
									t("selectPlaceholder") +
									" " +
									(dimension2Options?.[0]?.label ?? t("reference"))
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{dimension2Options.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}>
									{opt.value}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Label>{dimension3Options?.[0]?.label || t("dimension3")}</Label>
					<Select
						value={userDimensionThree}
						onValueChange={(value) => {
							setUserDimensionThree(value);
							setOrderData((prev) => ({
								...prev,
								salesOrderLines: prev.salesOrderLines.map((line) => ({
									...line,
									accountPart3: value,
								})),
							}));
						}}>
						<SelectTrigger>
							<SelectValue
								placeholder={
									t("selectPlaceholder") +
									" " +
									(dimension3Options?.[0]?.label ?? t("reference"))
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{dimension3Options.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}>
									{opt.value}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</>
			)}

			{dimensionInputMode === "search" && (
				<div>
					<DimensionSearchInput
						level={1}
						value={userDimensionOne}
						onChange={(value) => {
							setUserDimensionOne(value);
							setActiveDimension(value ? 1 : null);
						}}
						placeholder={t("dimension1")}
						onSelect={(dim) => {
							setUserDimensionOne(dim.dimensionName);
							setUserDimensionOneId(dim.dimensionId.toString());
							setActiveDimension(null);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customersOrderReference: dim.dimensionName,
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
						placeholder={t("dimension2")}
						onSelect={(dim) => {
							setUserDimensionTwo(dim.dimensionName);
							setUserDimensionTwoId(dim.dimensionId.toString());
							setActiveDimension(null);
							setOrderData((prev) => ({
								...prev,
								salesOrderHeader: {
									...prev.salesOrderHeader,
									customerReference: dim.dimensionName,
								},
							}));
						}}
						isVisible={activeDimension === null || activeDimension === 2}
						parentId={userDimensionOneId}
					/>

					<DimensionSearchInput
						level={3}
						value={userDimensionThree}
						onChange={(value) => {
							setUserDimensionThree(value);
							setActiveDimension(value ? 3 : null);
						}}
						placeholder={t("dimension3")}
						onSelect={(dim) => {
							setUserDimensionThree(dim.dimensionName);
							setUserDimensionThreeId(dim.dimensionId.toString());
							setActiveDimension(null);
							setOrderData((prev) => ({
								...prev,
								salesOrderLines: prev.salesOrderLines.map((line) => ({
									...line,
									accountPart3: dim.dimensionName,
								})),
							}));
						}}
						isVisible={activeDimension === null || activeDimension === 3}
						parentId={userDimensionTwoId}
					/>
				</div>
			)}

			{dimensionInputMode === "manual" && (
				<>
					<Input
						type="text"
						placeholder={t("dimension1")}
						value={userDimensionOne}
						onChange={(e) => {
							setUserDimensionOne(e.target.value);
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
						placeholder={t("dimension2")}
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
						placeholder={t("dimension3")}
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
