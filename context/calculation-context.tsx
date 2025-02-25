"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { calculateResults } from "@/lib/calculations";

export interface Column {
    key: string;
    header: string;
    type: "text" | "number" | "select" | "currency";
    options?: string[];
}

export interface CapTable {
    fullyDilutedShares: number;
    remainingOptions: number;
    newPoolSize: number;
}

export interface SafeNote {
    id: string;
    name: string;
    principal: number;
    valuationCap: number;
    type: "Pre-Money" | "Post-Money";
    discount: number;
    shares: number;
}

export interface Investor {
    id: string;
    name: string;
    principal: number;
    shares: number;
}

export interface NewRound {
    valuation: number;
    type: "Pre-Money" | "Post-Money";
    investors: Investor[];
}

export interface Result {
    id: string;
    name: string;
    principal: number;
    ownership: number;
    shares: number;
}

interface CalculationContextType {
    capTable: CapTable;
    safeNotes: SafeNote[];
    newRound: NewRound;
    results: Result[];
    updateCapTable: (data: CapTable) => void;
    updateSafeNotes: (data: SafeNote[]) => void;
    updateNewRound: (data: NewRound) => void;
}

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export function CalculationProvider({ children }: { children: React.ReactNode }) {
    const [capTable, setCapTable] = useState<CapTable>({
        fullyDilutedShares: 5000000,
        remainingOptions: 500000,
        newPoolSize: 10,
    });

    const [safeNotes, setSafeNotes] = useState<SafeNote[]>([]);

    const [newRound, setNewRound] = useState<NewRound>({
        valuation: 0,
        type: "Pre-Money",
        investors: [],
    });

    const [results, setResults] = useState<Result[]>([]);

    useEffect(() => {
      const newResults = calculateResults(capTable, safeNotes, newRound);
        setResults(newResults);
    }, [capTable, safeNotes, newRound]);

    return (
        <CalculationContext.Provider
            value={{
                capTable,
                safeNotes,
                newRound,
                results,
                updateCapTable: setCapTable,
                updateSafeNotes: setSafeNotes,
                updateNewRound: setNewRound,
            }}
        >
            {children}
        </CalculationContext.Provider>
    );
}

export function useCalculation() {
    const context = useContext(CalculationContext);
    if (context === undefined) {
        throw new Error("useCalculation must be used within a CalculationProvider");
    }
    return context;
}
