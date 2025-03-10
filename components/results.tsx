"use client";

import { useCalculation } from "@/context/calculation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Download } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

// Generate visually distinct colors for any number of sections using golden ratio
const generateColors = (count: number) => {
    const goldenRatio = 0.618033988749895;
    let hue = 0.15 ;
    
    const colors = Array.from({ length: count }, (_, i) => {
        hue = (hue + goldenRatio) % 1;
        const saturation = 65 + (i % 2) * 10; // Alternate between 65% and 75%
        const lightness = 55 + (i % 2) * 10;  // Alternate between 55% and 65%
        return `hsl(${Math.floor(hue * 360)}, ${saturation}%, ${lightness}%)`;
    });

    return colors.reverse();
};

export default function Results() {
    const { results } = useCalculation();
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

    const handleDownloadCSV = () => {
        const headers = ['Name,Investment Principal,Ownership %,Number of Shares'];
        const rows = results.map(result => 
            `${result.name},${result.principal},${result.ownership},${result.shares}`
        );
        const csv = headers.concat(rows).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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
                        <Button onClick={handleDownloadCSV} size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV</Button>
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

            {isTotalOwnershipValid && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Ownership Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div style={{ width: '400px', height: '400px' }}>
                            <Pie
                                data={{
                                    labels: results.map(result => result.name),
                                    datasets: [{
                                        data: results.map(result => result.ownership * 100),
                                        backgroundColor: generateColors(results.length),
                                        borderWidth: 1
                                    }]
                                }}
                                options={{
                                    plugins: {
                                        legend: {
                                            position: 'right' as const
                                        },
                                        tooltip: {
                                            callbacks: {
                                                title: () => '',
                                                label: function(context) {
                                                    return `${context.label}: ${context.parsed.toFixed(2)}%`;
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
