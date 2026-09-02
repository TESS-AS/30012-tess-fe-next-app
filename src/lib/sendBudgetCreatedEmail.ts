import axiosClient from "@/services/axiosClient";

interface SendBudgetCreatedEmailParams {
	toEmail: string;
	recipientName: string;
	annualAmount: number;
	validFrom: string;
	validTo: string;
	approverNames: string[];
}

const formatAmount = (n: number) =>
	new Intl.NumberFormat("nb-NO").format(Math.round(n));

const formatDate = (iso: string) => {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
	const [y, m, d] = iso.split("-");
	return `${d}.${m}.${y}`;
};

export function buildBudgetCreatedEmailSubject() {
	return "Nytt budsjett opprettet";
}

export function buildBudgetCreatedEmailHtml(
	params: SendBudgetCreatedEmailParams,
) {
	const approvers = params.approverNames.length
		? params.approverNames.map((n) => `<li>${n}</li>`).join("")
		: "<li>–</li>";

	return `
		<div style="font-family: Arial, sans-serif; color: #0F1912;">
			<h2 style="color: #009640;">Nytt budsjett opprettet</h2>
			<p>Hei ${params.recipientName},</p>
			<p>Det er opprettet et årsbudsjett for deg i TESS e-handel.</p>
			<table style="border-collapse: collapse; margin: 16px 0;">
				<tr>
					<td style="padding: 6px 12px 6px 0;"><strong>Beløp:</strong></td>
					<td style="padding: 6px 0;">${formatAmount(params.annualAmount)} kr/år</td>
				</tr>
				<tr>
					<td style="padding: 6px 12px 6px 0;"><strong>Periode:</strong></td>
					<td style="padding: 6px 0;">${formatDate(params.validFrom)} – ${formatDate(params.validTo)}</td>
				</tr>
			</table>
			<p><strong>Godkjennere:</strong></p>
			<ul>${approvers}</ul>
			<p style="color: #5A615D; font-size: 12px; margin-top: 32px;">
				Denne meldingen er sendt automatisk. Kontakt din superbruker ved spørsmål.
			</p>
		</div>
	`;
}

export async function sendBudgetCreatedEmail(
	params: SendBudgetCreatedEmailParams,
): Promise<void> {
	const formData = new FormData();
	formData.append("toEmail", params.toEmail);
	formData.append("subject", buildBudgetCreatedEmailSubject());
	formData.append("htmlBody", buildBudgetCreatedEmailHtml(params));
	formData.append("category", "BudgetCreated");
	await axiosClient.post("/sendgrid/sendEmail", formData);
}
