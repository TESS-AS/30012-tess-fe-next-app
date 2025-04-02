import plugin from "tailwindcss/plugin";

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	future: {
		hoverOnlyWhenSupported: true,
	},
	theme: {
		container: {
			center: true,
			padding: "30px",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontSize: {
				xxs: "0.625rem",
			},
			fontFamily: {
				tanker: "'Tanker', sans-serif",
			},
			boxShadow: {
				"start-game": "0 5px 0 0 #5338cc",
				"start-game-hover": "0 3px 0 0 #5338cc",
				"3d-button": "0 3px 0 0",
				"3d-button-hover": "0 3px 0 0",
				"blue-glow":
					"0 0 60px 30px white, 0 0 100px 60px teal, 0 0 140px 90px indigo",
			},
			sidebar: {
				DEFAULT: "hsl(var(--sidebar-background))",
				foreground: "hsl(var(--sidebar-foreground))",
				primary: "hsl(var(--sidebar-primary))",
				"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
				accent: "hsl(var(--sidebar-accent))",
				"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
				border: "hsl(var(--sidebar-border))",
				ring: "hsl(var(--sidebar-ring))",
			},
			colors: {
				common: "hsl(var(--common))",
				azure: "hsl(var(--azure))",
				lavender: "hsl(var(--lavender))",
				jonquil: "hsl(var(--jonquil))",
				mint: "hsl(var(--mint))",
				melon: "hsl(var(--melon))",
				dune: "hsl(var(--dune))",
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					hover: "hsl(var(--primary-hover))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					hover: "hsl(var(--secondary-hover))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					hover: "hsl(var(--popover-hover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				"blue-dark": "#efce3925", // For --tw-gradient-from
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			},
			keyframes: {
				glow: {
					"0%, 100%": {
						boxShadow:
							"0 0 0 2px hsl(var(--primary) 0), 0 0 0 3px hsl(var(--primary) 0)",
					},
					"25%": {
						boxShadow:
							"0 0 0 2px hsl(var(--primary)), 0 0 0 3px hsl(var(--primary))",
					},
					"50%": {
						boxShadow:
							"0 0 0 2px hsl(var(--primary)), 0 0 0 3px hsl(var(--primary))",
					},
					"75%": {
						boxShadow:
							"0 0 0 2px hsl(var(--primary) 50), 0 0 0 3px hsl(var(--primary) 50)",
					},
				},
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				float: {
					"0, 100%": {
						transform: "translate3d(0,-5%,0)",
					},
					"50%": {
						transform: "translate3d(0,5%,0)",
					},
				},
				scaleUpDown: {
					"0%, 100%": { transform: "scale(1)" },
					"50%": { transform: "scale(1.05)" },
				},
				rainZ: {
					"0%": {
						transform: "scale(10)",
						opacity: "0",
					},
					"25%": {
						transform: "scale(0)",
						opacity: "0.1",
					},
					"26%": {
						opacity: "0",
					},
					"100%": {
						transform: "scale(10)",
					},
				},
				rainY: {
					"0%": {
						top: "-10%",
						opacity: "0",
					},
					"19%": {
						top: "100%",
						opacity: "1",
						transform: "scaleY(1)",
					},
					"20%": {
						top: "100%",
						opacity: "1",
						transform: "scaleY(0.1)",
					},
					"25%": {
						top: "100%",
						opacity: "1",
						transform: "scaleY(0.1) scaleX(10)",
					},
					"26%": {
						opacity: "0",
					},
					"100%": {
						top: "-10%",
						opacity: "0",
					},
				},
				puddle: {
					"0%": {
						transform: "scale(0)",
						opacity: "0",
					},
					"20%": {
						transform: "scale(0)",
						opacity: "0",
					},
					"21%": {
						transform: "scale(0)",
						opacity: "1",
					},
					"25%": {
						transform: "scale(1)",
						opacity: "0",
					},
					"100%": {
						transform: "scale(0)",
						opacity: "0",
					},
				},
				tracks: {
					"0%": {
						transform: "scaleY(1) scaleX(1.2) rotate(270deg)",
					},
					"75%": {
						transform: "scaleY(1.2) rotate(270deg)",
					},
					"100%": {
						transform: "scaleY(1) scaleX(1.2) rotate(270deg)",
					},
				},
				risingstar: {
					from: {
						transform: "translateY(0px)",
					},
					to: {
						transform: "translateY(-3840px)",
					},
				},
				falldown: {
					"100%": {
						opacity: "0",
						transform: "translate3d(0, 1024px, 0)",
					},
				},
				jiggleArrow: {
					"0%": {
						rotate: "-2deg",
					},
					"75%": {
						rotate: "2deg",
					},
				},
				fadeInOut: {
					"0%": {
						opacity: "1",
					},
					"75%": {
						opacity: "0",
					},
				},
			},
			animation: {
				falldown: "falldown 3s infinite",
				risingstar: "risingstar 1000s linear infinite",
				glow: "glow 2s ease-in-out infinite",
				float: "float 1.5s ease-in-out infinite",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"scale-up-down": "scaleUpDown .4s ease-in-out",
				rainZ: "rainZ 4s linear infinite",
				rainY: "rainY 4s linear infinite",
				puddle: "puddle 4s linear infinite",
				tracks: "tracks 3s linear infinite",
				jiggleArrow: "jiggleArrow 0.1s linear infinite",
				fadeInOut: "fadeInOut 2s linear infinite",
				spinSlow: "spin 5s linear infinite",
			},
			transitionDuration: {
				DEFAULT: "100ms",
			},
			textShadow: {
				game: "rgb(9, 12, 29) -1px -2px, rgb(9, 12, 29) 0px -2px, rgb(9, 12, 29) 1px -2px, rgb(9, 12, 29) -2px -1px, rgb(9, 12, 29) -1px -1px, rgb(9, 12, 29) 0px -1px, rgb(9, 12, 29) 1px -1px, rgb(9, 12, 29) 2px -1px, rgb(9, 12, 29) -2px 0px, rgb(9, 12, 29) -1px 0px, rgb(9, 12, 29) 0px 0px, rgb(9, 12, 29) 1px 0px, rgb(9, 12, 29) 2px 0px, rgb(9, 12, 29) -2px 1px, rgb(9, 12, 29) -1px 1px, rgb(9, 12, 29) 0px 1px, rgb(9, 12, 29) 1px 1px, rgb(9, 12, 29) 2px 1px, rgb(9, 12, 29) -2px 2px, rgb(9, 12, 29) -1px 2px, rgb(9, 12, 29) 0px 2px, rgb(9, 12, 29) 1px 2px, rgb(9, 12, 29) 2px 2px, rgb(9, 12, 29) -1px 3px, rgb(9, 12, 29) 0px 3px, rgb(9, 12, 29) 1px 3px",
				DEFAULT: "0 2px 4px var(--tw-shadow-color)",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		plugin(function ({ matchUtilities, theme }: any) {
			matchUtilities(
				{
					"text-shadow": (value: any) => ({
						textShadow: value,
					}),
				},
				{ values: theme("textShadow") },
			);
		}),
	],
} satisfies any;

export default config;
