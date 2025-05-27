"use client";

import * as React from "react";

import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationSelector({
	onSelect,
}: {
	onSelect?: (coords: [number, number]) => void;
}) {
	useMapEvents({
		click(e) {
			onSelect?.([e.latlng.lat, e.latlng.lng]);
		},
	});
	return null;
}

export function MapFilterClient({
	center,
	zoom,
	onLocationChange,
}: {
	center: LatLngExpression;
	zoom: number;
	onLocationChange?: (coords: [number, number]) => void;
}) {
	return (
		<MapContainer
			center={center}
			zoom={zoom}
			style={{ height: "100%", width: "100%" }}>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<LocationSelector onSelect={onLocationChange} />
		</MapContainer>
	);
}
