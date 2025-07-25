// hooks/useContactPerson.ts
import { useEffect, useState } from "react";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { updateUserProfile } from "@/services/user.service";

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
    try {
      const response = await updateUserProfile(updated.firstName, updated.lastName, updated.phone);
      const updatedData = {
        firstName: response.UpdatedFields[0].firstName,
        lastName: response.UpdatedFields[0].lastName,
        email: updated.email,
        phone: response.UpdatedFields[0].userPhoneNumber,
      };
      setContactPerson(updatedData);
      return updatedData;
    } catch (error) {
      console.error("Failed to update contact person:", error);
      throw error;
    }
  };

  return {
    contactPerson,
    setContactPerson,
    handleSave,
  };
};
