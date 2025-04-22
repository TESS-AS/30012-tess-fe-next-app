export function formatUrlToDisplayName(urlString: string): string {
	// Replace hyphens with spaces and decode URI components
	const decodedString = decodeURIComponent(urlString.replace(/-/g, " "));

	// Capitalize first letter of each word
	return decodedString
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}
