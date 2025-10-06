import { Heart, MapPin, Package, Star, User, Lock } from "lucide-react";

export const profileTabs = [
	{
		title: "Mine bestillinger",
		value: "mine-bestillinger",
		icon: "/icons/profile/cart.svg",
	},
	{
		title: "Rekvisisjoner",
		value: "rekvisisjoner",
		icon: "/icons/profile/clipboard-check.svg",
	},
	{ value: "personal-info", label: "Personal Info", icon: User },
	{ value: "addresses", label: "Addresses", icon: MapPin },
	{ value: "orders", label: "Orders", icon: Package },
	{ value: "wishlist", label: "Wishlist", icon: Heart },
	{ value: "password", label: "Change Password", icon: Lock },
	{ value: "ratings", label: "Ratings", icon: Star },
];

export const indexToShort: Record<number, string> = {
	0: "Jan",
	1: "Feb",
	2: "Mar",
	3: "Apr",
	4: "Mai",
	5: "Jun",
	6: "Jul",
	7: "Aug",
	8: "Sep",
	9: "Okt",
	10: "Nov",
	11: "Des",
};
