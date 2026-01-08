import React from "react";

import {
	Document,
	Page,
	Text,
	View,
	Image,
	StyleSheet,
	Font,
} from "@react-pdf/renderer";

import { formatNorwegianCurrency } from "./formatCurrency";

interface ProductPdfData {
	name: string;
	itemNumber: string;
	gtin: string | null;
	imageUrl?: string;
	application?: string;
	notes?: string;
	specifications: Array<{ name: string; value: string }>;
	variants: Array<{
		itemNumber: string;
		attributes?: Record<string, string>;
		price?: number;
	}>;
	visibleAttributeNames?: string[];
	logoUrl?: string;
	locale: string;
}

// Helper function to shorten attribute names for PDF headers
const shortenAttributeName = (name: string, maxLength: number = 10): string => {
	if (!name) return "";
	if (name.length <= maxLength) return name;

	// Common abbreviations (both Norwegian and English)
	const abbreviations: Record<string, string> = {
		// English
		diameter: "Dia",
		length: "Len",
		width: "Wid",
		height: "Hgt",
		weight: "Wgt",
		color: "Col",
		material: "Mat",
		size: "Sz",
		thickness: "Thk",
		pressure: "Pres",
		temperature: "Temp",
		standard: "Std",
		certification: "Cert",
		content: "Cont",
		unit: "Unt",
		number: "No",
		code: "Cd",
		type: "Typ",
		// Norwegian
		lengde: "Len",
		bredde: "Brd",
		høyde: "Høy",
		vekt: "Vkt",
		farge: "Frg",
		materiale: "Mat",
		størrelse: "Stør",
		tykkelse: "Tyk",
		trykk: "Tryk",
		temperatur: "Temp",
		sertifisering: "Cert",
		innhold: "Innh",
		enhet: "Enh",
		nummer: "Nr",
		kode: "Kd",
	};

	// Check if the name contains any of these words
	const lowerName = name.toLowerCase();
	for (const [key, abbrev] of Object.entries(abbreviations)) {
		if (lowerName.includes(key)) {
			const shortened = name.replace(new RegExp(key, "gi"), abbrev);
			// If still too long, truncate
			if (shortened.length <= maxLength) return shortened;
		}
	}

	// If no abbreviation found or still too long, truncate intelligently
	// Try to keep important parts (first word, numbers, etc.)
	const words = name.split(/\s+/);
	if (words.length > 1) {
		// Take first word and abbreviate rest
		const firstWord = words[0];
		if (firstWord.length <= maxLength - 2) {
			return firstWord.substring(0, maxLength - 2) + "..";
		}
	}

	// Final fallback: truncate and add ellipsis
	return name.substring(0, maxLength - 1) + ".";
};

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 11,
		fontFamily: "Helvetica",
		color: "#000000",
		backgroundColor: "#ffffff",
	},
	header: {
		flexDirection: "row",
		marginBottom: 20,
		gap: 20,
		alignItems: "center",
	},
	productImage: {
		width: 150,
		maxWidth: 150,
		height: "auto",
		maxHeight: 250,
		objectFit: "contain",
		marginTop: 0,
	},
	productInfo: {
		flex: 1,
	},
	productName: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#000000",
	},
	productMeta: {
		fontSize: 11,
		color: "#6B7280",
		marginBottom: 2,
		fontWeight: 400,
	},
	productMetaValue: {
		fontSize: 11,
		color: "#000000",
		marginBottom: 8,
		fontWeight: "normal",
	},
	applicationSection: {
		marginTop: 12,
		marginBottom: 8,
	},
	applicationTitle: {
		fontSize: 11,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 4,
	},
	applicationText: {
		fontSize: 11,
		color: "#000000",
		fontWeight: "normal",
		lineHeight: 1.5,
	},
	notesSection: {
		marginTop: 8,
		marginBottom: 0,
	},
	notesTitle: {
		fontSize: 11,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 4,
	},
	notesText: {
		fontSize: 11,
		color: "#000000",
		fontWeight: "normal",
		lineHeight: 1.5,
	},
	section: {
		marginBottom: 25,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 500,
		marginBottom: 10,
		color: "#003D1A",
	},
	sectionDivider: {
		height: 1,
		backgroundColor: "#DDDDDD",
		marginBottom: 12,
	},
	specifications: {
		marginTop: 0,
	},
	specRow: {
		flexDirection: "row",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#DDDDDD",
	},
	specRowLast: {
		borderBottomWidth: 0,
	},
	specLabel: {
		fontWeight: 400,
		color: "#6B7280",
		fontSize: 11,
		flex: 1,
		textTransform: "uppercase",
	},
	specValue: {
		color: "#374151",
		fontSize: 11,
		fontWeight: 400,
		textAlign: "right",
		flex: 1,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#DDDDDD",
		paddingVertical: 8,
		width: "100%",
		alignItems: "flex-start",
	},
	tableHeader: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#DDDDDD",
		paddingVertical: 8,
		backgroundColor: "transparent",
		width: "100%",
	},
	tableCell: {
		paddingHorizontal: 4,
		fontSize: 10,
		color: "#374151",
		fontWeight: 400,
		flex: 1,
	},
	tableCellPrice: {
		paddingHorizontal: 4,
		fontSize: 10,
		color: "#374151",
		fontWeight: 400,
		flex: 1,
		textAlign: "right",
	},
	tableHeaderCell: {
		paddingHorizontal: 4,
		fontSize: 9,
		color: "#6B7280",
		fontWeight: 600,
		textTransform: "uppercase",
		flex: 1,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 40,
		paddingTop: 15,
		borderTopWidth: 1,
		borderTopColor: "#DDDDDD",
	},
	timestamp: {
		fontSize: 10,
		color: "#000000",
		fontWeight: "normal",
	},
	logo: {
		width: 50,
	},
});

const ProductPdfDocument = ({ data }: { data: ProductPdfData }) => {
	const {
		name,
		itemNumber,
		gtin,
		imageUrl,
		application,
		notes,
		specifications,
		variants,
		visibleAttributeNames = [],
		logoUrl,
	} = data;

	const now = new Date();
	const timestamp = now.toLocaleString("no-NO", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	const attributesWithData = visibleAttributeNames.filter((attrName) =>
		variants.some(
			(v) =>
				v.attributes?.[attrName] &&
				v.attributes[attrName] !== "-" &&
				v.attributes[attrName].trim() !== "",
		),
	);

	return (
		<Document>
			{/* First Page: Product Info and Specifications */}
			<Page
				size="A4"
				style={styles.page}>
				<View style={styles.header}>
					{imageUrl && (
						<Image
							src={imageUrl}
							style={styles.productImage}
						/>
					)}
					<View style={styles.productInfo}>
						<Text style={styles.productName}>{name}</Text>
						<View style={{ marginBottom: 4 }}>
							<Text style={styles.productMeta}>Varenummer:</Text>
							<Text style={styles.productMetaValue}>{itemNumber || "-"}</Text>
						</View>
						<View style={{ marginBottom: 4 }}>
							<Text style={styles.productMeta}>GTIN:</Text>
							<Text style={styles.productMetaValue}>{gtin || "-"}</Text>
						</View>
						{application && (
							<View style={styles.applicationSection}>
								<Text style={styles.applicationTitle}>Anvendelse:</Text>
								<Text style={styles.applicationText}>{application}</Text>
							</View>
						)}
						{notes && (
							<View style={styles.notesSection}>
								<Text style={styles.notesTitle}>Merknader:</Text>
								<Text style={styles.notesText}>{notes}</Text>
							</View>
						)}
					</View>
				</View>

				{specifications.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Spesifikasjoner</Text>
						<View style={styles.specifications}>
							{specifications.map((spec, index) => {
								const isLast = index === specifications.length - 1;
								return (
									<View
										key={index}
										style={
											isLast
												? [styles.specRow, styles.specRowLast]
												: styles.specRow
										}>
										<Text style={styles.specLabel}>{spec.name}</Text>
										<Text style={styles.specValue}>{spec.value || "-"}</Text>
									</View>
								);
							})}
						</View>
					</View>
				)}

				<View style={styles.footer}>
					<Text style={styles.timestamp}>Print: {timestamp}</Text>
					{logoUrl && (
						<Image
							src={logoUrl}
							style={styles.logo}
						/>
					)}
				</View>
			</Page>

			{/* Second Page: Variant Table (always on page 2) */}
			{variants.length > 0 && (
				<Page
					size="A4"
					style={styles.page}>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Varianter</Text>
						<View style={styles.tableHeader}>
							<Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>VN</Text>
							{attributesWithData.map((attrName, idx) => (
								<Text
									key={idx}
									style={styles.tableHeaderCell}>
									{shortenAttributeName(attrName, 10).toUpperCase()}
								</Text>
							))}
							{attributesWithData.length === 0 && (
								<Text style={styles.tableHeaderCell}>-</Text>
							)}
							<Text
								style={[
									styles.tableHeaderCell,
									{ textAlign: "right", flex: 0.8 },
								]}>
								PRIS
							</Text>
						</View>
						{variants.map((variant, index) => (
							<View
								key={index}
								style={styles.tableRow}>
								<Text style={[styles.tableCell, { flex: 1.2 }]}>
									{variant.itemNumber}
								</Text>
								{attributesWithData.map((attrName, idx) => {
									const value =
										variant.attributes?.[attrName] &&
										variant.attributes[attrName] !== "-" &&
										variant.attributes[attrName].trim() !== ""
											? variant.attributes[attrName]
											: "-";
									return (
										<Text
											key={idx}
											style={styles.tableCell}>
											{value}
										</Text>
									);
								})}
								{attributesWithData.length === 0 && (
									<Text style={styles.tableCell}>-</Text>
								)}
								<Text style={[styles.tableCellPrice, { flex: 0.8 }]}>
									{variant.price && variant.price > 0
										? formatNorwegianCurrency(variant.price)
										: "-"}
								</Text>
							</View>
						))}
					</View>

					<View style={styles.footer}>
						<Text style={styles.timestamp}>Print: {timestamp}</Text>
						{logoUrl && (
							<Image
								src={logoUrl}
								style={styles.logo}
							/>
						)}
					</View>
				</Page>
			)}
		</Document>
	);
};

async function imageToDataUrl(imagePath: string): Promise<string> {
	try {
		const response = await fetch(imagePath);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch image: ${response.status} ${response.statusText}`,
			);
		}
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("Feil ved konvertering av bilde til data URL:", error);
		throw error;
	}
}

export async function generateProductPdf(data: ProductPdfData) {
	const { pdf } = await import("@react-pdf/renderer");

	let convertedImageUrl = data.imageUrl;
	if (
		data.imageUrl &&
		(data.imageUrl.startsWith("/") || !data.imageUrl.startsWith("http"))
	) {
		try {
			convertedImageUrl = await imageToDataUrl(data.imageUrl);
		} catch (error) {
			console.warn("Kunne ikke konvertere produktbilde:", error);
		}
	}

	let logoDataUrl: string | undefined;
	try {
		logoDataUrl = await imageToDataUrl("/images/tess-logo.png");
	} catch (error) {
		console.warn("Kunne ikke laste logo fra /images/tess-logo.png:", error);
	}

	const pdfInstance = pdf(
		<ProductPdfDocument
			data={{ ...data, imageUrl: convertedImageUrl, logoUrl: logoDataUrl }}
		/>,
	);
	const blob = await pdfInstance.toBlob();

	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${data.name.replace(/[^a-z0-9]/gi, "_")}_${data.itemNumber}.pdf`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
