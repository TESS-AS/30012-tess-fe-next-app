export function Quote() {
	return (
		<section className="container py-5">
			<div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
				<div className="space-y-4 md:w-1/2">
					<p className="text-muted-foreground text-sm tracking-wide uppercase">
						24/7 Hassle-Free
					</p>
					<h2 className="text-3xl leading-tight font-bold md:text-4xl">
						Services and <br />
						Sustainable Solutions
					</h2>
				</div>

				<div className="flex gap-6 md:w-1/2 md:items-stretch">
					<div className="hidden w-px bg-black md:block" />
					<p className="text-muted-foreground text-md leading-relaxed">
						Specialists in hoses for all purposes for over 55 years. Leading
						providers of welding, operational, and maintenance products, and
						critical, cost-effective solutions for businesses.
					</p>
				</div>
			</div>
		</section>
	);
}
