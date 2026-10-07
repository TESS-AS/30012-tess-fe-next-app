export type HoseFittingAngle = {
	angleId: number;
	angleName: string;
	sortOrder: number;
};

export type HoseFittingGender = {
	genderId: number;
	genderName: string;
	sortOrder: number;
};

export type HoseFittingMaterial = {
	materialId: number;
	materialType: string;
	sortOrder: number;
};

export type HoseFittingRotationAngle = {
	rotationAngleId: number;
	rotationAngleName: string;
	sortOrder: number;
};

export type HoseFittingType = {
	typeFittingId: number;
	typeFittingName: string;
};

export type HoseFittingSubCategory = {
	subCategoryId: number;
	subCategoryName: string;
};

export type HoseFittingMedia = {
	mediaId: number;
	mediaName: string;
	sortOrder: number;
};

export type HoseFittingCover = {
	hoseCoverId: number;
	hoseCoverName: string;
	sortOrder: number;
};

export type SelectOption = {
	value: string;
	label: string;
};
