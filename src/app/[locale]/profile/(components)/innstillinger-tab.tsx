"use client";

import { useEffect, useState } from "react";

import { useGetCurrentUserForSettings } from "@/hooks/useGetCurrentUserForSettings";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useUpdateUserRelations } from "@/hooks/useUpdateUserRelations";
import {
	profileSchema,
	ProfileFormValues,
} from "@/lib/validation/profileSchema";
import { UpdateUserRelationsPayload } from "@/types/user.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
	ContactInfoSection,
	getRoleKeyFromProfile,
	INNSTILLINGER_CLASSES,
	TilgangerSection,
	UserRightsSection,
} from "./innstillinger";

const T_SETTINGS = "InnstillingerTab";
const T_BULK = "BulkEditConfirmationModal";

interface InnstillingerTabProps {
	onDirtyChange?: (dirty: boolean) => void;
}

export function InnstillingerTab({ onDirtyChange }: InnstillingerTabProps) {
	const tSettings = useTranslations(T_SETTINGS);
	const tBulk = useTranslations(T_BULK);

	const { data: profile } = useGetProfileData();
	const {
		currentUser,
		isLoading: isLoadingCurrentUser,
		refetch: refetchCurrentUser,
	} = useGetCurrentUserForSettings(profile?.userId);
	const { mutateAsync: updateUserRelations } = useUpdateUserRelations();

	const { register, setValue } = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
	});

	const [superuserBannerDismissed, setSuperuserBannerDismissed] =
		useState(false);
	const [employeeBannerDismissed, setEmployeeBannerDismissed] = useState(false);
	const [isSavingAccess, setIsSavingAccess] = useState(false);

	const roleKey = getRoleKeyFromProfile(profile?.role);

	useEffect(() => {
		if (profile) {
			setValue("firstName", profile.firstName || "");
			setValue("lastName", profile.lastName || "");
			setValue("email", profile.email || "");
			setValue("phoneNumber", profile.phoneNumber || "");
		}
	}, [profile, setValue]);
	const handleSaveAccess = async (payload: UpdateUserRelationsPayload) => {
		if (isSavingAccess) return;
		setIsSavingAccess(true);
		try {
			await updateUserRelations(payload);
			refetchCurrentUser();
			toast(tBulk("successUpdatingUsers"), { type: "success" });
			onDirtyChange?.(false);
		} catch (error) {
			let message = tBulk("errorUpdatingUsers");
			if (typeof error === "object" && error !== null && "response" in error) {
				const err = error as AxiosError<{ error?: string }>;
				message = err.response?.data?.error ?? message;
			}
			toast(message, { type: "error" });
		} finally {
			setIsSavingAccess(false);
		}
	};

	if (!profile) {
		return (
			<div className={INNSTILLINGER_CLASSES.card}>
				<p className={INNSTILLINGER_CLASSES.loading}>
					{tSettings("loadingProfile")}
				</p>
			</div>
		);
	}

	return (
		<div className={INNSTILLINGER_CLASSES.card}>
			<ContactInfoSection register={register} />

			<UserRightsSection roleKey={roleKey} />

			{currentUser != null && (
				<TilgangerSection
					roleKey={roleKey}
					profileUserId={profile.userId}
					currentUser={currentUser}
					isLoadingCurrentUser={isLoadingCurrentUser}
					superuserBannerDismissed={superuserBannerDismissed}
					employeeBannerDismissed={employeeBannerDismissed}
					onSuperuserBannerDismiss={() => setSuperuserBannerDismissed(true)}
					onEmployeeBannerDismiss={() => setEmployeeBannerDismissed(true)}
					onSaveAccess={handleSaveAccess}
					isSavingAccess={isSavingAccess}
					onDirtyChange={onDirtyChange}
				/>
			)}
		</div>
	);
}
