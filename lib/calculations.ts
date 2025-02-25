import { SafeNote, NewRound, CapTable, Result } from "@/context/calculation-context";

export function calculateResults(capTable: CapTable, safeNotes: SafeNote[], newRound: NewRound): Result[] {
    const maxIterations = 500;
    const convergenceThreshold = 0.00001;
    let iteration = 0;
    let converged = false;

    let preMoneyValuation = newRound.valuation;
    if (newRound.type === "Post-Money") {
        preMoneyValuation -= newRound.investors.reduce((sum, inv) => sum + inv.principal, 0);
    }

    let sharePrice = 1;
    let esopExpansion = 0;
    let sharesAfterSafeConversion = 1;
    let sharesAfterEsopExpansion = 1;
    let sharesAfterNewRound = 1;

    while (sharePrice >= 0 && !converged && iteration < maxIterations) {
        const prevSharePrice = sharePrice;
        // 1. Calculate new round share price
        sharePrice = preMoneyValuation / sharesAfterEsopExpansion;
        // 2. Calculate ESOP pool expansion
        esopExpansion = Math.max(0, (capTable.newPoolSize / 100) * sharesAfterNewRound - capTable.remainingOptions);

        // 3. Calculate SAFE conversions
        safeNotes = safeNotes.map((safe) => {
            const discountedValuation = safe.valuationCap * (safe.discount / 100);
            const preMoneyShares =
                safe.principal / (discountedValuation / (capTable.fullyDilutedShares + esopExpansion));
            const postMoneyShares = safe.principal / (discountedValuation / sharesAfterSafeConversion);
            const sharesAtSafePrice = safe.type === "Pre-Money" ? preMoneyShares : postMoneyShares;
            const sharesAtNewPrice = safe.principal / sharePrice;
            return {
                ...safe,
                shares: Math.round(Math.max(sharesAtSafePrice, sharesAtNewPrice)),
            };
        });
        // 4. Calculate shares after SAFE conversion
        sharesAfterSafeConversion = capTable.fullyDilutedShares + safeNotes.reduce((sum, safe) => sum + safe.shares, 0);

        // 5. Calculate shares after ESOP expansion
        sharesAfterEsopExpansion = sharesAfterSafeConversion + esopExpansion;

        // 6. Calculate new investor shares
        newRound.investors = newRound.investors.map((investor) => ({
            ...investor,
            shares: Math.round(investor.principal / sharePrice),
        }));

        // 7. Calculate shares after new round
        sharesAfterNewRound = sharesAfterEsopExpansion + newRound.investors.reduce((sum, inv) => sum + inv.shares, 0);

        // Check convergence
        const change = Math.abs(sharePrice - prevSharePrice);
        converged = change < convergenceThreshold;
        iteration++;
    }
    // Combine all results
    const results: Result[] = [
        ...safeNotes.map((safe) => ({
            id: safe.id,
            name: safe.name,
            principal: safe.principal,
            ownership: safe.shares / sharesAfterNewRound,
            shares: safe.shares,
        })),
        ...newRound.investors.map((investor) => ({
            id: investor.id,
            name: investor.name,
            principal: investor.principal,
            ownership: investor.shares / sharesAfterNewRound,
            shares: investor.shares,
        })),
        {
            id: "existing_shareholders",
            name: "Existing Shareholders",
            principal: 0,
            ownership: (capTable.fullyDilutedShares - capTable.remainingOptions) / sharesAfterNewRound,
            shares: Math.round(capTable.fullyDilutedShares - capTable.remainingOptions),
        },
        {
            id: "esop_expansion",
            name: "Option Pool",
            principal: 0,
            ownership: (esopExpansion + capTable.remainingOptions) / sharesAfterNewRound,
            shares: Math.round(esopExpansion + capTable.remainingOptions),
        },
    ];

    return results;
}
