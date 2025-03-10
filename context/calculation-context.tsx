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

const STORAGE_KEY = 'safe-calc-state';

function saveToStorage(state: Partial<CalculationContextType>) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function loadFromStorage(): Partial<CalculationContextType> | null {
    if (typeof window === 'undefined') return null;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to load state:', e);
        return null;
    }
}

export function CalculationProvider({ children }: { children: React.ReactNode }) {
    const savedState = loadFromStorage();
    
    const [capTable, setCapTable] = useState<CapTable>(savedState?.capTable ?? {
        fullyDilutedShares: 5000000,
        remainingOptions: 500000,
        newPoolSize: 10,
    });

    const [safeNotes, setSafeNotes] = useState<SafeNote[]>(savedState?.safeNotes ?? []);

    const [newRound, setNewRound] = useState<NewRound>(savedState?.newRound ?? {
        valuation: 0,
        type: "Pre-Money",
        investors: [],
    });

    const [results, setResults] = useState<Result[]>([]);

    useEffect(() => {
        const newResults = calculateResults(capTable, safeNotes, newRound);
        setResults(newResults);
    }, [capTable, safeNotes, newRound]);

    // Save state changes to localStorage
    useEffect(() => {
        saveToStorage({ capTable, safeNotes, newRound });
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
