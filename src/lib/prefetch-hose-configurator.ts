import { hoseDiameterKeys } from "@/hooks/useGetHoseDiameter";
import { hoseMediumKeys } from "@/hooks/useGetHoseMedium";
import { hosePressureKeys } from "@/hooks/useGetHosePressure";
import { hoseTemperatureKeys } from "@/hooks/useGetHoseTemperature";
import { hoseFittingKeys } from "@/hooks/useHoseFittingOptions";
import {
	getHoseDiameter,
	getHoseMedium,
	getHosePressure,
	getHoseTemperature,
} from "@/services/hose-configurator.service";
import {
	getHoseAngle,
	getHoseGender,
	getHoseMaterial,
	getHoseRotationAngle,
	getTypeFitting,
} from "@/services/hose-fitting.service";

import { queryClient } from "./queryClient";

const LOOKUP_STALE_TIME = 30 * 60 * 1000;
const LOOKUP_GC_TIME = 60 * 60 * 1000;

/**
 * Warm React Query cache for configurator lookup lists so step 1/2 dropdowns
 * don't wait on cold network every visit within the same SPA session.
 */
export function prefetchHoseConfiguratorLookups() {
	const common = {
		staleTime: LOOKUP_STALE_TIME,
		gcTime: LOOKUP_GC_TIME,
	} as const;

	void queryClient.prefetchQuery({
		queryKey: hoseDiameterKeys.all,
		queryFn: getHoseDiameter,
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hoseMediumKeys.all,
		queryFn: getHoseMedium,
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hosePressureKeys.all,
		queryFn: getHosePressure,
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hoseTemperatureKeys.all,
		queryFn: getHoseTemperature,
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hoseFittingKeys.typeFitting(true),
		queryFn: () => getTypeFitting(true),
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hoseFittingKeys.gender(true),
		queryFn: () => getHoseGender(true),
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hoseFittingKeys.angle(true),
		queryFn: () => getHoseAngle(true),
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hoseFittingKeys.material(true),
		queryFn: () => getHoseMaterial(true),
		...common,
	});
	void queryClient.prefetchQuery({
		queryKey: hoseFittingKeys.rotationAngle(),
		queryFn: getHoseRotationAngle,
		...common,
	});
}
