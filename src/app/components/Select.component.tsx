import React, { useState } from "react";

const OmniSelect: React.FC = () => {
	const [count, setCount] = useState<number>(1);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const parsedValue = parseInt(value, 10);

		if (value === "") {
			setCount(1);
		} else if (!isNaN(parsedValue) && parsedValue >= 1) {
			setCount(parsedValue);
		}
	};

	return (
		<div className="w-auto">
			<div className="flex items-center gap-0 rounded-md shadow-md">
				<button
					className="rounded-l-md border-none bg-gray-300 px-4 py-2 text-black focus:outline-none"
					onClick={() => setCount((prev) => Math.max(1, prev - 1))}
					aria-label="Decrease count">
					-
				</button>

				<input
					type="number"
					value={count}
					onChange={handleInputChange}
					className="w-16 appearance-none border-none bg-gray-200 text-center focus:outline-none"
					min="1"
					onKeyDown={(e) => {
						if (e.key === "-" || e.key === "e") {
							e.preventDefault();
						}
					}}
					aria-label="Count input"
				/>

				<button
					className="rounded-r-md border-none bg-gray-300 px-4 py-2 text-black focus:outline-none"
					onClick={() => setCount((prev) => prev + 1)}
					aria-label="Increase count">
					+
				</button>
			</div>
		</div>
	);
};

export default OmniSelect;
