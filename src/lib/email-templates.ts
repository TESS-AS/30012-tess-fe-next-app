export const SUPPORT_EMAIL_RECIPIENT = "netthandel@tess.no";
export const ORDER_TSS_EMAIL_RECIPIENT = "tess@tess.no";

// TODO: confirm with stakeholder which inbox the THM hose team should receive these in
export const THM_TEAM_EMAIL_RECIPIENT = "netthandel@tess.no";

export type HoseContactMethod = "phone" | "email";

interface HoseContactEmailParams {
	caseId: string;
	userName: string;
	userEmail: string;
	userPhone: string | null;
	customerNumber: string;
	companyName: string;
	contactMethod: HoseContactMethod;
	contactValue: string;
	message: string;
	urgent: boolean;
	hexagonIds: string[];
}

interface HoseRfqEmailParams {
	caseId: string;
	userName: string;
	userEmail: string;
	userPhone: string | null;
	customerNumber: string;
	companyName: string;
	deliveryAddress: string;
	comment: string;
	includePressureTest: boolean;
	urgent: boolean;
	hexagonIds: string[];
}

interface OnboardingEmailParams {
	userEmail: string;
	userId: string | number;
	companyName: string;
	department?: string;
	orgNumber?: string;
	postalCode?: string;
}

interface FaqFeedbackEmailParams {
	userName: string;
	userEmail: string;
	faqTitle: string;
	message: string;
	wantsContact: boolean;
}

interface UserFeedbackEmailParams {
	userName: string;
	userEmail: string;
	userId?: string | number;
	feedbackType: string;
	message: string;
}

function wrapEmailLayout(heading: string, content: string): string {
	return `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
			<div style="background-color: #1C6D2C; padding: 20px 24px;">
				<h2 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">${heading}</h2>
			</div>
			<div style="padding: 24px; background-color: #ffffff; border: 1px solid #e5e7e6; border-top: none;">
				${content}
			</div>
			<div style="padding: 16px 24px; background-color: #f9fafb; border: 1px solid #e5e7e6; border-top: none; text-align: center;">
				<p style="margin: 0; font-size: 12px; color: #6b7280;">
					Denne e-posten ble generert automatisk fra TESS netthandel.
				</p>
			</div>
		</div>
	`;
}

function infoRow(label: string, value: string): string {
	return `
		<tr>
			<td style="padding: 8px 12px; font-weight: 600; color: #374151; white-space: nowrap; vertical-align: top;">${label}</td>
			<td style="padding: 8px 12px; color: #1a1a1a;">${value}</td>
		</tr>
	`;
}

export function buildOnboardingEmailHtml({
	userEmail,
	userId,
	companyName,
	department,
	orgNumber,
	postalCode,
}: OnboardingEmailParams): string {
	const rows = [
		infoRow("Bruker", userEmail),
		infoRow("Bruker-ID", String(userId)),
		infoRow("Bedrift", companyName),
		...(department ? [infoRow("Avdeling", department)] : []),
		...(orgNumber ? [infoRow("Organisasjonsnummer", orgNumber)] : []),
		...(postalCode ? [infoRow("Postnummer", postalCode)] : []),
	];

	const content = `
		<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
			En ny bruker har sendt inn bedriftsinformasjon og venter på kontokobling.
		</p>
		<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px;">
			${rows.join("")}
		</table>
		<p style="margin: 20px 0 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
			Vennligst koble brukerens konto til riktig bedrift så snart som mulig.
		</p>
	`;

	return wrapEmailLayout("Ny bruker — kontokobling", content);
}

export function buildOnboardingEmailSubject(companyName: string): string {
	return `Onboarding: Ny bruker venter på kontokobling — ${companyName}`;
}

export function buildFaqFeedbackEmailHtml({
	userName,
	userEmail,
	faqTitle,
	message,
	wantsContact,
}: FaqFeedbackEmailParams): string {
	const rows = [
		infoRow("Bruker", `${userName} / ${userEmail}`),
		infoRow("Opprinnelig FAQ-tema", faqTitle),
		infoRow("Brukerens melding", message),
		infoRow("Ønsker å bli kontaktet", wantsContact ? "Ja" : "Nei"),
	];

	const content = `
		<p style="margin: 0 0 4px; font-size: 14px; line-height: 1.6;">
			Hei til dere på kundeservice,
		</p>
		<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
			En bruker har markert en FAQ-artikkel som «ikke hjelpsom» og ber om assistanse.
		</p>
		<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px;">
			${rows.join("")}
		</table>
		<p style="margin: 20px 0 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
			Brukeren fant ikke svaret de lette etter i hjelpesenteret.
			Vennligst ta kontakt for å avklare manglende informasjon og hjelpe med pålogging eller kontokobling.
		</p>
	`;

	return wrapEmailLayout("FAQ-oppfølging", content);
}

export function buildFaqFeedbackEmailSubject(faqTitle: string): string {
	return `FAQ-oppfølging: Bruker trenger hjelp med ${faqTitle}`;
}

export function buildUserFeedbackEmailHtml({
	userName,
	userEmail,
	userId,
	feedbackType,
	message,
}: UserFeedbackEmailParams): string {
	const escapedMessage = message
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\n/g, "<br />");

	const rows = [
		infoRow("Bruker", userName),
		infoRow("E-post", userEmail),
		...(userId !== undefined && userId !== ""
			? [infoRow("Bruker-ID", String(userId))]
			: []),
		infoRow("Type tilbakemelding", feedbackType),
		infoRow("Melding", escapedMessage),
	];

	const content = `
		<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
			En bruker har sendt inn en tilbakemelding via TESSIX netthandel.
		</p>
		<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px;">
			${rows.join("")}
		</table>
	`;

	return wrapEmailLayout("Ny tilbakemelding fra bruker", content);
}

export function buildUserFeedbackEmailSubject(feedbackType: string): string {
	return `Tilbakemelding: ${feedbackType}`;
}

interface OrderConfirmationEmailLine {
	itemNumber: string;
	itemName: string;
	quantity: number;
	totalPrice: number;
	/** Absolute URL to a product thumbnail. Optional — kit lines won't have one. */
	imageUrl?: string;
}

interface OrderConfirmationEmailTotals {
	originalPrice: number;
	discounts: number;
	sumAfterDiscount: number;
	deliverySurcharge: number;
	vat: number;
	totalIncVat: number;
	showVat: boolean;
}

interface OrderConfirmationEmailParams {
	orderNumber: string;
	date: string;
	paymentMethod: string;
	name: string;
	company: string;
	addressLines: string[];
	phone: string;
	email: string;
	lines: OrderConfirmationEmailLine[];
	totals: OrderConfirmationEmailTotals;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function formatCurrencyForEmail(amount: number): string {
	const safe = Number.isFinite(amount) ? amount : 0;
	return `${safe.toLocaleString("nb-NO", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})} kr`;
}

export function buildOrderConfirmationEmailHtml({
	orderNumber,
	date,
	paymentMethod,
	name,
	company,
	addressLines,
	phone,
	email,
	lines,
	totals,
}: OrderConfirmationEmailParams): string {
	const infoRows = [
		infoRow("Ordrenummer", `#${escapeHtml(orderNumber)}`),
		infoRow("Dato", escapeHtml(date)),
		infoRow("Betalingsmåte", escapeHtml(paymentMethod)),
		infoRow("Navn", escapeHtml(name)),
		...(company ? [infoRow("Firma", escapeHtml(company))] : []),
		...(addressLines.length
			? [infoRow("Adresse", addressLines.map(escapeHtml).join("<br />"))]
			: []),
		...(phone ? [infoRow("Telefon", escapeHtml(phone))] : []),
		...(email ? [infoRow("E-post", escapeHtml(email))] : []),
	];

	// Nested table for the Vare cell so Outlook + Apple Mail align the
	// thumbnail and the name/number block reliably. Inline-block / flex don't
	// work consistently across email clients — table cells do.
	const renderVareCell = (l: OrderConfirmationEmailLine): string => {
		const imageHtml = l.imageUrl
			? `<td style="padding-right: 10px; vertical-align: top; width: 56px;">
					<img src="${escapeHtml(l.imageUrl)}" alt="" width="48" height="48" style="display: block; border: 0; border-radius: 4px; object-fit: contain; background: #f7f7f7;" />
				</td>`
			: "";
		return `
			<td style="padding: 8px 12px; border-bottom: 1px solid #e5e7e6; color: #1a1a1a; vertical-align: top;">
				<table cellspacing="0" cellpadding="0" border="0" role="presentation">
					<tr>
						${imageHtml}
						<td style="vertical-align: top;">
							<div style="font-weight: 600;">${escapeHtml(l.itemName)}</div>
							<div style="font-size: 12px; color: #6b7280;">${escapeHtml(l.itemNumber)}</div>
						</td>
					</tr>
				</table>
			</td>
		`;
	};

	const lineRows = lines
		.map(
			(l) => `
				<tr>
					${renderVareCell(l)}
					<td style="padding: 8px 12px; border-bottom: 1px solid #e5e7e6; text-align: right; color: #1a1a1a; vertical-align: top;">${l.quantity}</td>
					<td style="padding: 8px 12px; border-bottom: 1px solid #e5e7e6; text-align: right; color: #1a1a1a; white-space: nowrap; vertical-align: top;">${formatCurrencyForEmail(l.totalPrice)}</td>
				</tr>
			`,
		)
		.join("");

	const totalsRows = [
		`<tr><td style="padding: 6px 12px; color: #5A615D;">Pris</td><td style="padding: 6px 12px; text-align: right; color: #1a1a1a;">${formatCurrencyForEmail(totals.originalPrice)}</td></tr>`,
		`<tr><td style="padding: 6px 12px; color: #5A615D;">Rabatter</td><td style="padding: 6px 12px; text-align: right; color: #1a1a1a;">${formatCurrencyForEmail(totals.discounts)}</td></tr>`,
		`<tr><td style="padding: 6px 12px; color: #5A615D;">Sum etter rabatt</td><td style="padding: 6px 12px; text-align: right; color: #1a1a1a;">${formatCurrencyForEmail(totals.sumAfterDiscount)}</td></tr>`,
		`<tr><td style="padding: 6px 12px; color: #5A615D;">Frakttillegg</td><td style="padding: 6px 12px; text-align: right; color: #1a1a1a;">${formatCurrencyForEmail(totals.deliverySurcharge)}</td></tr>`,
		...(totals.showVat
			? [
					`<tr><td style="padding: 6px 12px; color: #5A615D;">MVA</td><td style="padding: 6px 12px; text-align: right; color: #1a1a1a;">${formatCurrencyForEmail(totals.vat)}</td></tr>`,
				]
			: []),
		`<tr><td style="padding: 10px 12px; border-top: 2px solid #1a1a1a; font-weight: 700; color: #1a1a1a;">Total inkl. MVA</td><td style="padding: 10px 12px; border-top: 2px solid #1a1a1a; text-align: right; font-weight: 700; color: #1a1a1a;">${formatCurrencyForEmail(totals.totalIncVat)}</td></tr>`,
	].join("");

	const content = `
		<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
			Takk for din ordre! Bestillingen din er mottatt og bekreftet.
		</p>
		<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px; margin-bottom: 24px;">
			${infoRows.join("")}
		</table>

		${
			lineRows
				? `
					<h3 style="margin: 0 0 8px; font-size: 15px; color: #1a1a1a;">Varelinjer</h3>
					<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px; margin-bottom: 24px;">
						<thead>
							<tr style="background-color: #f9fafb;">
								<th style="padding: 8px 12px; text-align: left; color: #374151;">Vare</th>
								<th style="padding: 8px 12px; text-align: right; color: #374151;">Antall</th>
								<th style="padding: 8px 12px; text-align: right; color: #374151;">Pris</th>
							</tr>
						</thead>
						<tbody>${lineRows}</tbody>
					</table>
				`
				: ""
		}

		<h3 style="margin: 0 0 8px; font-size: 15px; color: #1a1a1a;">Sammendrag</h3>
		<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px;">
			${totalsRows}
		</table>

		<p style="margin: 24px 0 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
			Trenger du hjelp? Kontakt oss på <a href="mailto:${ORDER_TSS_EMAIL_RECIPIENT}" style="color: #1C6D2C;">${ORDER_TSS_EMAIL_RECIPIENT}</a>.
		</p>
	`;

	return wrapEmailLayout(
		`Ordrebekreftelse #${escapeHtml(orderNumber)}`,
		content,
	);
}

export function buildOrderConfirmationEmailSubject(
	orderNumber: string,
): string {
	return `Ordrebekreftelse #${orderNumber}`;
}

function renderHexagonIdChips(ids: string[]): string {
	if (ids.length === 0) return "<em>Ingen valgt</em>";
	return ids
		.map(
			(id) =>
				`<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 8px;border-radius:4px;background:#E8EAE9;color:#005522;font-size:12px;">${escapeHtml(
					id,
				)}</span>`,
		)
		.join("");
}

export function buildHoseContactEmailHtml({
	caseId,
	userName,
	userEmail,
	userPhone,
	customerNumber,
	companyName,
	contactMethod,
	contactValue,
	message,
	urgent,
	hexagonIds,
}: HoseContactEmailParams): string {
	const rows = [
		infoRow("Saksnummer", caseId),
		infoRow("Bruker", userName),
		infoRow("E-post", userEmail),
		...(userPhone ? [infoRow("Telefon", userPhone)] : []),
		infoRow("Bedrift", `${companyName} (${customerNumber})`),
		infoRow(
			"Ønsket kontaktmåte",
			contactMethod === "phone" ? "Ring meg" : "Send meg en e-post",
		),
		infoRow(
			contactMethod === "phone" ? "Telefonnummer" : "E-postadresse",
			escapeHtml(contactValue),
		),
		infoRow("Hastesak", urgent ? "Ja" : "Nei"),
		infoRow("Valgte slanger", renderHexagonIdChips(hexagonIds)),
		...(message
			? [infoRow("Kort melding", escapeHtml(message).replace(/\n/g, "<br />"))]
			: []),
	];

	const content = `
		<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
			En bruker har bedt om å bli kontaktet av en fagperson om valgte slanger.
		</p>
		<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px;">
			${rows.join("")}
		</table>
	`;

	return wrapEmailLayout("Snakk med en fagperson — ny henvendelse", content);
}

export function buildHoseContactEmailSubject(
	urgent: boolean,
	customerNumber: string,
): string {
	const base = `Snakk med en fagperson — kunde ${customerNumber}`;
	return urgent ? `URGENT: ${base}` : base;
}

export function buildHoseRfqEmailHtml({
	caseId,
	userName,
	userEmail,
	userPhone,
	customerNumber,
	companyName,
	deliveryAddress,
	comment,
	includePressureTest,
	urgent,
	hexagonIds,
}: HoseRfqEmailParams): string {
	const rows = [
		infoRow("Saksnummer", caseId),
		infoRow("Bruker", userName),
		infoRow("E-post", userEmail),
		...(userPhone ? [infoRow("Telefon", userPhone)] : []),
		infoRow("Bedrift", `${companyName} (${customerNumber})`),
		infoRow(
			"Leveringsadresse",
			deliveryAddress ? escapeHtml(deliveryAddress) : "—",
		),
		infoRow(
			"Inkluder trykktest og sertifikat",
			includePressureTest ? "Ja" : "Nei",
		),
		infoRow("Hastesak", urgent ? "Ja" : "Nei"),
		infoRow("Valgte slanger", renderHexagonIdChips(hexagonIds)),
		...(comment
			? [infoRow("Kommentar", escapeHtml(comment).replace(/\n/g, "<br />"))]
			: []),
	];

	const content = `
		<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
			En bruker har sendt en forespørsel om tilbud (RFQ) for valgte slanger.
		</p>
		<table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e5e7e6; border-radius: 6px;">
			${rows.join("")}
		</table>
	`;

	return wrapEmailLayout("Send forespørsel om tilbud (RFQ)", content);
}

export function buildHoseRfqEmailSubject(
	urgent: boolean,
	customerNumber: string,
): string {
	const base = `RFQ — kunde ${customerNumber}`;
	return urgent ? `URGENT: ${base}` : base;
}

export function generateCaseId(prefix: "KTAK" | "RFQ"): string {
	const now = Date.now().toString(36).toUpperCase();
	const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
	return `${prefix}-${now}-${rand}`;
}
