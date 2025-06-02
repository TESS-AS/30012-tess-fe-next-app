"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface AppContextType {
	isCartChanging: boolean;
	setIsCartChanging: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const [isCartChanging, setIsCartChanging] = useState(false);

	return (
		<AppContext.Provider value={{ isCartChanging, setIsCartChanging }}>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = (): AppContextType => {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error("useAppContext must be used within an AppContextProvider");
	}
	return context;
};
