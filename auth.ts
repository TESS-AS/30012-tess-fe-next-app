import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { auth, handlers } = NextAuth({
	providers: [
		// Tenant User
		MicrosoftEntraID({
			id: "microsoft-entra-id-tenant",
			clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID_TENANT_USER,
			clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET_TENANT_USER,
			issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER_TENANT_USER,
		}),
		// SSO User
		MicrosoftEntraID({
			clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID_SSO_USER,
			clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET_SSO_USER,
			issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER_SSO_USER,
			authorization: {
				params: {
					prompt: "select_account",
					scope: "openid profile email",
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, account }: any) {
			if (account) {
				token.accessToken = account.access_token;
				token.idToken = account.id_token;
			}
			return token;
		},
		async session({ session, token }: any) {
			session.accessToken = token.accessToken;
			session.idToken = token.idToken;
			return session;
		},
	},
});
