import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";

function LocationSelector({
	onSelect,
}: {
	onSelect: (coords: [number, number]) => void;
}) {
	useMapEvents({
		click(e: { latlng: { lat: number; lng: number } }) {
			onSelect([e.latlng.lat, e.latlng.lng]);
		},
	});
	return null;
}

export function MapFilter({
	onLocationChange,
}: {
	onLocationChange: (coords: [number, number]) => void;
}) {
	return (
		<div className="h-64 w-full overflow-hidden rounded-xl border shadow">
			<MapContainer
				center={[60.472, 8.4689] as LatLngExpression}
				zoom={5}
				style={{ height: "100%", width: "100%" }}>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				<LocationSelector onSelect={onLocationChange} />
			</MapContainer>
		</div>
	);
}
