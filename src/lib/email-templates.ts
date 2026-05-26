export const SUPPORT_EMAIL_RECIPIENT = "netthandel@tess.no";

interface OnboardingEmailParams {
	userEmail: string;
	userId: string | number;
	companyName: string;
	department?: string;
	orgNumber?: string;
	serviceCenterName: string;
}

interface FaqFeedbackEmailParams {
	userName: string;
	userEmail: string;
	faqTitle: string;
	message: string;
	wantsContact: boolean;
	sessionId?: string;
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
	serviceCenterName,
}: OnboardingEmailParams): string {
	const rows = [
		infoRow("Bruker", userEmail),
		infoRow("Bruker-ID", String(userId)),
		infoRow("Bedrift", companyName),
		...(department ? [infoRow("Avdeling", department)] : []),
		...(orgNumber ? [infoRow("Organisasjonsnummer", orgNumber)] : []),
		infoRow("TESS servicesenter", serviceCenterName),
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
	sessionId,
}: FaqFeedbackEmailParams): string {
	const rows = [
		infoRow("Bruker", `${userName} / ${userEmail}`),
		infoRow("Opprinnelig FAQ-tema", faqTitle),
		infoRow("Brukerens melding", message),
		infoRow("Ønsker å bli kontaktet", wantsContact ? "Ja" : "Nei"),
		...(sessionId ? [infoRow("Sesjons-ID", sessionId)] : []),
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
