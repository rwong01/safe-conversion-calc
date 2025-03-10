"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useCalculation, Column, Investor } from "@/context/calculation-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import EditableTable from "./editable-table";
import NewRoundInvestorPopup from "./new-round-investor-popup";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function NewRound() {
    const { newRound, updateNewRound } = useCalculation();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const columns: Column[] = [
        { key: "name", header: "Name", type: "text" },
        { key: "principal", header: "Investment Principal", type: "currency" },
    ];

    const handleAdd = () => {
        setEditingInvestor(null);
        setIsPopupOpen(true);
    };

    const handleEdit = (investor: Investor) => {
        setEditingInvestor(investor);
        setIsPopupOpen(true);
    };

    const handleSave = (investor: Investor) => {
        if (editingInvestor) {
            updateNewRound({
                ...newRound,
                investors: newRound.investors.map((inv) => (inv.id === investor.id ? investor : inv)),
            });
        } else {
            updateNewRound({
                ...newRound,
                investors: [...newRound.investors, { ...investor, id: Date.now().toString() }],
            });
        }
        setIsPopupOpen(false);
    };

    const handleDelete = (id: string) => {
        updateNewRound({
            ...newRound,
            investors: newRound.investors.filter((investor) => investor.id !== id),
        });
    };

    const handleClearAll = () => {
        const confirmed = window.confirm('Are you sure you want to clear all investors? This action cannot be undone.');
        if (confirmed) {
            updateNewRound({ ...newRound, investors: [] });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').map(row => row.split(','));
            const headers = rows[0].map(h => h.trim().toLowerCase());
            
            // Validate headers
            const requiredHeaders = ['name', 'investment principal'];
            const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));
            if (!hasAllHeaders) {
                alert('CSV must include headers: Name, Investment Principal');
                return;
            }

            // Map column indices
            const nameIdx = headers.indexOf('name');
            const principalIdx = headers.indexOf('investment principal');

            // Process data rows
            const newInvestors: Investor[] = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length !== headers.length) continue;

                // Validate and parse values
                const principal = parseFloat(row[principalIdx].replace(/[^0-9.-]+/g, ""));

                // Validation
                if (isNaN(principal) || principal <= 0) {
                    alert(`Invalid principal amount in row ${i}`);
                    return;
                }

                newInvestors.push({
                    id: Date.now().toString() + i,
                    name: row[nameIdx].trim(),
                    principal,
                    shares: 0,
                });
            }

            updateNewRound({ ...newRound, investors: [...newRound.investors, ...newInvestors] });
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    const handleDownloadCSV = () => {
        const headers = ['Name,Investment Principal'];
        const rows = newRound.investors.map(investor => 
            `${investor.name},${investor.principal}`
        );
        const csv = headers.concat(rows).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'new-round-investors.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Priced Round</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="valuation">Valuation</Label>
                            <Input
                                id="valuation"
                                value={newRound.valuation === 0 ? "" : formatCurrency(newRound.valuation)}
                                onChange={(e) => {
                                    const value = Number.parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                    updateNewRound({
                                        ...newRound,
                                        valuation: isNaN(value) ? 0 : value,
                                    });
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <div className="">
                                        <Tooltip.Trigger asChild>
                                            <Label htmlFor="type">
                                                Type
                                                <span>ℹ️</span>
                                            </Label>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content side="right" align="center" className="tooltip-content">
                                            Usually this is pre-money
                                            <Tooltip.Arrow className="tooltip-arrow" />
                                        </Tooltip.Content>
                                    </div>
                                </Tooltip.Root>
                            </Tooltip.Provider>

                            <Select
                                value={newRound.type}
                                onValueChange={(value) =>
                                    updateNewRound({
                                        ...newRound,
                                        type: value as "Pre-Money" | "Post-Money",
                                    })
                                }
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pre-Money">Pre-Money</SelectItem>
                                    <SelectItem value="Post-Money">Post-Money</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-md">Investors</h3>
                        <div className="flex gap-2">
                            <Button onClick={handleClearAll} size="sm" variant="outline">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear All
                        </Button>
                        <Button onClick={handleImportClick} size="sm" variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </Button>
                        <Button onClick={handleDownloadCSV} size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download CSV
                        </Button>
                        <Button onClick={handleAdd} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Investor
                        </Button>
                        </div>
                    </div>
                    <EditableTable
                        data={newRound.investors}
                        columns={columns}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </CardContent>
            {isPopupOpen && (
                <NewRoundInvestorPopup
                    investor={editingInvestor}
                    onSave={handleSave}
                    onCancel={() => setIsPopupOpen(false)}
                />
            )}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileImport}
            />
        </Card>
    );
}
