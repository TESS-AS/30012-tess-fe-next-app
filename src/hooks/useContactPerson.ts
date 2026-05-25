import { useEffect, useState } from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";

export interface ContactPersonData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
}

export const useContactPerson = () => {
	const { data: profile } = useGetProfileData();

	const [contactPerson, setContactPerson] = useState<ContactPersonData>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});

	useEffect(() => {
		if (profile) {
			setContactPerson({
				firstName: profile.firstName || "",
				lastName: profile.lastName || "",
				email: profile.email || "",
				phone: profile.phoneNumber || "",
			});
		}
	}, [profile]);

	const handleSave = async (updated: ContactPersonData) => {
		setContactPerson(updated);
		return updated;
	};

	return {
		contactPerson,
		setContactPerson,
		handleSave,
	};
};
