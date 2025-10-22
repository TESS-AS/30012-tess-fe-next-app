export interface HoseHeader {
	hoseLineId: number;
	assetId: number;
	extSystemCode: string;
	companyCode: string;
	extDocSequenceId: string;
	requestDate: string;
	requestTime: string;
	documentName: string;
	methodName: string;
	customerNumber: string;
	otherInfo: string;
	customerOrderNumber: string;
	tessOrderNumber: string;
	tessAsOrderNumber: string;
	organization: string;
	department: string;
}

export interface S1Info {
	s1Id: number;
	s1Code: string;
	s1Name: string;
	customerId: number;
}

export interface S2Info {
	s2Id: number;
	s2Code: string;
	s2Name: string;
	s1Id: number;
}

export interface GenericHoseType {
	genericHoseTypeId: number;
	genericHoseTypeName: string;
}

export interface GetAssetsResponse {
	hoseHeader: HoseHeader;
	hoseLine: {
		hoseLineId: number;
		assetId: number;
		hexagonId: string;
		itemDescription: string;
		rfid: string;
		state: "GOOD" | "BAD" | "UNKNOWN";
		classOrg: string;
		parentSystem: number;
		s1: S1Info;
		s2: S2Info;
		equipmentSubunit: string;
		customerId: number;
		customerEq: string;
		system: string;
		productionDate: string;
		installedDate: string;
		numberOfHoses: number;
		genericHoseTypeId: GenericHoseType;
		generalCommentPtc: string;
		originalHoseComment: string;
		additionalComment: string;
		primarySystem: string;
		hoseReel: string;
		spiralGuard: string;
		hoseProtection: string;
		hookie: string;
		whipcheck: string;
		breakaway: string;
		currentStatus: "Processed" | "Pending" | "Failed";
	};
	hoseData: {
		hoseLineId: number;
		assetId: number;
		class: {
			classId: number;
			className: string;
		};
		status: {
			statusId: number;
			status: string;
		};
		type: {
			typeId: number;
			typeName: string;
		};
		hoseType: {
			hoseTypeId: number;
			hoseTypeName: string;
		};
		hoselengthMm: number;
		hoselengthFtIn: string;
		wpBar: number;
		wpPsi: number;
		ferrule1: string;
		ferrule2: string;
		insert1: string;
		insert2: string;
		hoseDimension: {
			hoseDimensionId: number;
			hoseDimension: string;
		};
		hoseOtherInfo: string;
		couplingOrientation: {
			couplingOrientationId: number;
			orientationCode: string;
		};
		pinPricked: boolean;
		hoseMediumTemperature: string;
		hoseFunction: string;
		hoseWarranty: "YES" | "NO";
		hoseWarrantyComment: string;
	};
	customerData: {
		hoseLineId: number;
		assetId: number;
		drawingNumber: string;
		posNumber: string;
		artNumber: string;
		customerArtNumber: string;
		criticality: {
			criticalityId: number;
			criticalityName: string;
		};
		pollutionExposure: string;
		uxExposure: string;
		cleaning: string;
		flushingStandard: string;
		flushingMedia: {
			flushingMediaId: number;
			flushingMediaName: string;
		};
		minimumTemperature: string;
		maximumTemperature: string;
		color: number;
		spareSetHose: boolean;
		emergencyHoseLink: string;
		emergencyHoseComment: string;
		partNumberUpdatesNeeded: boolean;
	};
	testing: {
		hoseLineId: number;
		assetId: number;
		testTime: string;
		testMediumStats: string;
		pressureTestStatus: string;
		bendingRadius: string;
		thirdPartySharing: string;
	};
	maintenanceDetails: {
		hoseLineId: number;
		assetId: number;
		inspectedDate: string;
		inspector: string;
		hoseCondition: string;
		approved: boolean;
		inspectionComment: string;
		nextInspectionDate: string;
		pressureTestDate: string;
		pressureTestOnInterval: boolean;
		nextPressureTest: string;
		nextHoseReplacement: string;
	};
	hoseFitting1: {
		hoseLineId: number;
		assetId: number;
		fittingType: string;
		typeFittingEnd: {
			typeFittingEndId: string;
			fittingEnd: string;
			genericDimensionEndId: string;
		};
		genericDimensionEnd: {
			genericDimensionEndId: string;
			genericDimensionName: string;
		};
		genderEnd: string;
		angleEnd: string;
		materialQualityEnd: string;
		commentEndPtc: string;
	};
	hoseFitting2: {
		hoseLineId: number;
		assetId: number;
		fittingType: string;
		typeFittingEnd: {
			typeFittingEndId: string;
			fittingEnd: string;
			genericDimensionEndId: string;
		};
		genericDimensionEnd: {
			genericDimensionEndId: string;
			genericDimensionName: string;
		};
		genderEnd: string;
		angleEnd: string;
		materialQualityEnd: string;
		commentEndPtc: string;
	};
	additionals: {
		hoseLineId: number;
		assetId: number;
		aEnd1: string;
		bEnd1: string;
		cEnd1: string;
		dEnd1: string;
		eEnd1: string;
		fEnd1: string;
		gEnd1: string;
		hEnd1: string;
		aEnd2: string;
		bEnd2: string;
		cEnd2: string;
		dEnd2: string;
		eEnd2: string;
		fEnd2: string;
		gEnd2: string;
		hEnd2: string;
	};
}

export interface S1Codes {
	S1Id: number;
	S1Code: string;
	S1Name: string;
	S2Id: number;
	S2Code: string;
	S2Name: string;
}

export interface GetHoseHistory {
	assetId: number;
	hoseLineId: number;
	workOrderNumber: number;
	content: object[];
	workOrderId: number;
	description: string;
	userId: number;
}
