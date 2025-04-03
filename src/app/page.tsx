import Link from "next/link";

export default function Home() {
	return (
		<div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
			<div className="flex justify-between gap-5">
				<Link href="/cement">Cement</Link>
				<Link href="/tiles">Tiles</Link>
				<Link href="/cement/ultra-strong">Ultra Strong Cement</Link>
				<Link href="/tiles/porcelain-white">Porcelain White Tile</Link>
				<Link href="/about">About Us</Link>
				<Link href="/contact">Contact</Link>
			</div>
		</div>
	);
}
