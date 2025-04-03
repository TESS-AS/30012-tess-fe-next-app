import React, { useState } from "react";

const OmniSelect: React.FC = () => {
  const [count, setCount] = useState<number>(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const parsedValue = parseInt(value, 10);

    if (value === "") {
      setCount(1);
    } else if (!isNaN(parsedValue) && parsedValue >= 1) {
      setCount(parsedValue);
    }
  };

  return (
    <div className="w-auto">
      <div className="flex items-center gap-0 shadow-md rounded-md">
        <button
          className="px-4 py-2 bg-gray-300 text-black border-none rounded-l-md focus:outline-none"
          onClick={() => setCount((prev) => Math.max(1, prev - 1))}
          aria-label="Decrease count"
        >
          -
        </button>

        <input
          type="number"
          value={count}
          onChange={handleInputChange}
          className="w-16 text-center border-none focus:outline-none appearance-none bg-gray-200"
          min="1"
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e") {
              e.preventDefault();
            }
          }}
          aria-label="Count input"
        />

        <button
          className="px-4 py-2 bg-gray-300 text-black border-none rounded-r-md focus:outline-none"
          onClick={() => setCount((prev) => prev + 1)}
          aria-label="Increase count"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default OmniSelect;
