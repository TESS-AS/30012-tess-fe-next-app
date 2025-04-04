import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Home() {
	const t = useTranslations("HomePage");
	return (
		<div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
			<div className="flex justify-between gap-5">
				<p>{t("title")}</p>
				<Link href="/cement">Cement</Link>
				<Link href="/tiles">Tiles</Link>
				<Link href="/cement/ultra-strong">Ultra Strong Cement</Link>
				<Link href="/cement/ultra-strong">Ultra Strong Cement</Link>
				<Link href="/tiles/porcelain-white">Porcelain White Tile</Link>
				<Link href="/about">About Us</Link>
				<Link href="/contact">Contact</Link>
			</div>
		</div>
	);
}
