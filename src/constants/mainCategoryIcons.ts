import {
	Archive,
	Drill,
	Droplet,
	Filter,
	Flame,
	FlaskConical,
	Forklift,
	Hammer,
	Lightbulb,
	Settings,
	Shield,
	UserCog,
	Wrench,
} from "lucide-react";

export const categoryIconMap: Record<string, React.ElementType> = {
	"01000000": Droplet, // Hoses and pipes
	"02000000": Hammer, // Tools and machines
	"03000000": Shield, // PPE, clothing and shoes
	"04000000": Flame, // Welding
	"05000000": Drill, // Fasteners
	"06000000": FlaskConical, // Chemicals
	"07000000": Lightbulb, // Lighting and electrical
	"08000000": Settings, // Transmissions
	"09000000": Forklift, // Lifting and loading
	"10000000": Archive, // Office and storage
	"12000000": Filter, // Filters
	"13000000": Wrench, // Maintenance products
	"14000000": UserCog, // Customer specific products
};
