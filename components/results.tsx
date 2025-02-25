"use client";

import { useCalculation } from "@/context/calculation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export default function Results() {
    const { results, capTable, safeNotes, newRound } = useCalculation();
    const formatCurrency = (value: number) => {
        if (value <= 0) {
            return "-";
        } else {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
            }).format(value);
        }
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat("en-US").format(value);
    };

    const formatPercentage = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "percent",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();

        // Cap Table Sheet
        const capTableData = [
            ["Fully Diluted Shares", capTable.fullyDilutedShares],
            ["Remaining Options", capTable.remainingOptions],
            ["New Employee Pool Size", `${capTable.newPoolSize}%`],
        ];
        const capTableSheet = XLSX.utils.aoa_to_sheet(capTableData);
        XLSX.utils.book_append_sheet(workbook, capTableSheet, "Cap Table");

        // SAFE Notes Sheet
        const safeNotesData = [["Name", "Principal", "Valuation Cap", "Type", "Discount", "Shares"]].concat(
            safeNotes.map(
                (safe) =>
                    [
                        safe.name,
                        safe.principal.toString(),
                        safe.valuationCap.toString(),
                        safe.type,
                        `${safe.discount}%`,
                        safe.shares.toString(),
                    ] as string[]
            )
        );
        const safeNotesSheet = XLSX.utils.aoa_to_sheet(safeNotesData);
        XLSX.utils.book_append_sheet(workbook, safeNotesSheet, "SAFE Notes");

        // New Round Sheet
        const newRoundData = [
            ["Valuation", newRound.valuation.toString()],
            ["Type", newRound.type],
            ["Investors"],
            ["Name", "Principal", "Shares"],
        ].concat(
            newRound.investors.map((inv) => [inv.name, inv.principal.toString(), inv.shares.toString()] as string[])
        );
        const newRoundSheet = XLSX.utils.aoa_to_sheet(newRoundData);
        XLSX.utils.book_append_sheet(workbook, newRoundSheet, "New Round");

        // Results Sheet
        const resultsData = [["Name", "Principal", "Ownership %", "Number of Shares"]].concat(
            results.map(
                (result) =>
                    [
                        result.name,
                        result.principal.toString(),
                        result.ownership.toString(),
                        result.shares.toString(),
                    ] as string[]
            )
        );
        const resultsSheet = XLSX.utils.aoa_to_sheet(resultsData);
        XLSX.utils.book_append_sheet(workbook, resultsSheet, "Results");

        // Add formulas to the Results sheet
        resultsSheet["C2"] = { f: "D2/SUM($D$2:$D$" + (results.length + 1) + ")" };
        XLSX.utils.sheet_add_aoa(resultsSheet, [["", "", "Ownership %", "Number of Shares"]], { origin: "A1" });

        XLSX.writeFile(workbook, "SAFE_Conversion_Results.xlsx");
    };
    // Calculate totals
    const totalPrincipal = results.reduce((sum, result) => sum + result.principal, 0);
    const totalOwnership = results.reduce((sum, result) => sum + result.ownership, 0);
    const totalShares = results.reduce((sum, result) => sum + result.shares, 0);
    const isTotalOwnershipValid = totalOwnership >= 0.99 && totalOwnership <= 1.01;

    return (
        <>
            {/* Conditional Error Card */}
            {!isTotalOwnershipValid && (
                <Card className="mb-4 bg-red-100 border border-red-400">
                    <CardHeader>
                        <CardTitle className="text-red-600">Invalid Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">Missing new round valuation.</p>
                    </CardContent>
                </Card>
            )}

            {isTotalOwnershipValid && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Conversion Results</CardTitle>
                        <Button onClick={exportToExcel}>Export to Excel</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Investment</TableHead>
                                    <TableHead>Ownership %</TableHead>
                                    <TableHead>Number of Shares</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((result) => (
                                    <TableRow key={result.id}>
                                        <TableCell>{result.name}</TableCell>
                                        <TableCell>{formatCurrency(result.principal)}</TableCell>
                                        <TableCell>{formatPercentage(result.ownership)}</TableCell>
                                        <TableCell>{formatNumber(result.shares)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="border-t-2 border-slate-800"></TableRow>
                                <TableRow className="font-bold ">
                                    <TableCell>Total</TableCell>
                                    <TableCell>{formatCurrency(totalPrincipal)}</TableCell>
                                    <TableCell>{formatPercentage(totalOwnership)}</TableCell>
                                    <TableCell>{formatNumber(totalShares)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
