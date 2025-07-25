import axiosInstance from "./axiosClient";


export async function updateUserProfile(
    firstName: string,
    lastName: string,
    userPhoneNumber: string,
): Promise<{
    UpdatedFields: [
        {
            firstName: string;
            lastName: string;
            userPhoneNumber: string;
        }
    ]
}> {
    try {
        const response = await axiosInstance.patch(`/user`, {
            firstName,
            lastName,
            userPhoneNumber,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}
