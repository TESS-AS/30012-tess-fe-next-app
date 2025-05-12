import { Heart, MapPin, Package, Star, User, Lock } from "lucide-react";

export const profileTabs = [
	{ value: "personal-info", label: "Personal Info", icon: User },
	{ value: "addresses", label: "Addresses", icon: MapPin },
	{ value: "orders", label: "Orders", icon: Package },
	{ value: "wishlist", label: "Wishlist", icon: Heart },
	{ value: "password", label: "Change Password", icon: Lock },
	{ value: "ratings", label: "Ratings", icon: Star },
];
