import type { HoseBruksomradeDraft, HoseKoblingerDraft, HoseSpecsDraft } from "@/lib/hose-configurator-draft";
import type {
	HoseAssemblyEnd,
	HoseAssemblyRequest,
} from "@/types/hose-configurator.types";

type LabeledOption = {
	value: string;
	label: string;
};

type RotationOption = LabeledOption & {
	degrees: string;
};

type BuildHoseAssemblyInput = {
	itemNumber: string;
	bruksomrade: HoseBruksomradeDraft | null;
	koblinger: HoseKoblingerDraft | null;
	specs: HoseSpecsDraft | null;
	fittingTypeOptions: LabeledOption[];
	connectionOptions: LabeledOption[];
	designOptions: LabeledOption[];
	materialOptions: LabeledOption[];
	rotationAngles: RotationOption[];
};

function toNumber(value: string | number | null | undefined): number | null {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}
	if (typeof value !== "string" || value.trim() === "") return null;
	const parsed = Number(value.trim().replace(/\s/g, "").replace(",", "."));
	return Number.isFinite(parsed) ? parsed : null;
}

function labelOf(value: string, options: LabeledOption[]): string | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

function mapEnd(
	end: HoseSpecsDraft["end1"],
	options: Pick<
		BuildHoseAssemblyInput,
		| "fittingTypeOptions"
		| "connectionOptions"
		| "designOptions"
		| "materialOptions"
	>,
): HoseAssemblyEnd {
	return {
		fittingType: labelOf(end.fittingType, options.fittingTypeOptions),
		gender: labelOf(end.connection, options.connectionOptions),
		fittingEndDimension: end.size.trim() || null,
		angle: labelOf(end.design, options.designOptions),
		material: labelOf(end.material, options.materialOptions),
	};
}

function orientationAngle(
	angleId: string,
	rotationAngles: RotationOption[],
): string | null {
	const trimmed = angleId.trim();
	if (!trimmed) return null;
	const match = rotationAngles.find((option) => option.value === trimmed);
	if (!match) return trimmed.includes("°") ? trimmed : `${trimmed}°`;
	if (match.degrees) return `${match.degrees}°`;
	return match.label;
}

export function buildHoseAssemblyRequest(
	input: BuildHoseAssemblyInput,
): HoseAssemblyRequest | null {
	const { itemNumber: rawItemNumber, bruksomrade, specs } = input;
	const itemNumber = rawItemNumber.trim();
	if (!itemNumber) return null;

	const end1 = specs?.end1;
	const end2 = specs?.endsEqual ? end1 : specs?.end2;
	const temperature =
		toNumber(bruksomrade?.temperatureMax) ??
		toNumber(bruksomrade?.temperatureMin) ??
		toNumber(bruksomrade?.temperature);
	const otherRequirments = bruksomrade?.moreRequirements.trim() || null;
	const marking = specs?.customMarking.trim() || null;

	return {
		hose: {
			itemNumber,
			dimension: bruksomrade?.hoseSize.trim() || null,
			temperature,
			pressure: toNumber(bruksomrade?.workingPressure),
			medium: bruksomrade?.medium.trim() || null,
			lengthMeters: toNumber(input.koblinger?.lengthMtr),
			quantity: Math.max(1, input.koblinger?.quantity ?? 1),
			otherRequirments,
		},
		end1: end1
			? mapEnd(end1, input)
			: {
					fittingType: null,
					gender: null,
					fittingEndDimension: null,
					angle: null,
					material: null,
				},
		end2: end2
			? mapEnd(end2, input)
			: {
					fittingType: null,
					gender: null,
					fittingEndDimension: null,
					angle: null,
					material: null,
				},
		orientationAngle: orientationAngle(specs?.angle ?? "", input.rotationAngles),
		service: {
			pressureTesting: true,
			dataSheet: specs?.options.testCertificate ?? false,
			specialMarking: marking,
			spiralGuard: specs?.options.spiralProtection ?? false,
		},
	};
}
