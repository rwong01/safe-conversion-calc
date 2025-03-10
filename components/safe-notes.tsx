"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useCalculation, Column, SafeNote } from "@/context/calculation-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import EditableTable from "./editable-table";
import SafeNotePopup from "./safe-note-popup";

export default function SafeNotes() {
    const { safeNotes, updateSafeNotes } = useCalculation();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingSafe, setEditingSafe] = useState<SafeNote | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const columns: Column[] = [
        { key: "name", header: "Name", type: "text" },
        { key: "principal", header: "Investment Principal", type: "currency" },
        { key: "valuationCap", header: "Valuation Cap", type: "currency" },
        {
            key: "type",
            header: "Type",
            type: "select",
            options: ["Pre-Money", "Post-Money"],
        },
        { key: "discount", header: "Discount (%)", type: "number" },
    ];

    const handleAdd = () => {
        setEditingSafe(null);
        setIsPopupOpen(true);
    };

    const handleEdit = (safe: SafeNote) => {
        setEditingSafe(safe);
        setIsPopupOpen(true);
    };

    const handleSave = (safe: SafeNote) => {
        const fullSafe: SafeNote = {
            id: safe.id || Date.now().toString(),
            name: safe.name,
            principal: safe.principal,
            valuationCap: safe.valuationCap,
            type: safe.type,
            discount: safe.discount,
            shares: safe.shares ?? 0,
        };

        if (editingSafe) {
            updateSafeNotes(safeNotes.map((s) => (s.id === fullSafe.id ? fullSafe : s)));
        } else {
            updateSafeNotes([...safeNotes, fullSafe]);
        }

        setIsPopupOpen(false);
    };

    const handleDelete = (id: string) => {
        updateSafeNotes(safeNotes.filter((safe) => safe.id !== id));
    };

    const handleClear = () => {
        const confirmed = window.confirm('Are you sure you want to clear all SAFE notes? This action cannot be undone.');
        if (confirmed) {
            updateSafeNotes([]);
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
            const requiredHeaders = ['name', 'investment principal', 'valuation cap', 'type', 'discount'];
            const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));
            if (!hasAllHeaders) {
                alert('CSV must include headers: Name, Investment Principal, Valuation Cap, Type, Discount');
                return;
            }

            // Map column indices
            const nameIdx = headers.indexOf('name');
            const principalIdx = headers.indexOf('investment principal');
            const capIdx = headers.indexOf('valuation cap');
            const typeIdx = headers.indexOf('type');
            const discountIdx = headers.indexOf('discount');

            // Process data rows
            const newSafes: SafeNote[] = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length !== headers.length) continue;

                // Validate and parse values
                const principal = parseFloat(row[principalIdx].replace(/[^0-9.-]+/g, ""));
                const cap = parseFloat(row[capIdx].replace(/[^0-9.-]+/g, ""));
                const type = row[typeIdx].trim();
                const discount = parseFloat(row[discountIdx]);

                // Validation
                if (isNaN(principal) || principal <= 0) {
                    alert(`Invalid principal amount in row ${i}`);
                    return;
                }
                if (isNaN(cap) || cap <= 0) {
                    alert(`Invalid valuation cap in row ${i}`);
                    return;
                }
                if (type !== 'Pre-Money' && type !== 'Post-Money') {
                    alert(`Invalid type in row ${i}. Must be "Pre-Money" or "Post-Money"`);
                    return;
                }
                if (isNaN(discount) || discount < 0 || discount > 100) {
                    alert(`Invalid discount in row ${i}. Must be between 0 and 100`);
                    return;
                }

                newSafes.push({
                    id: Date.now().toString() + i,
                    name: row[nameIdx].trim(),
                    principal,
                    valuationCap: cap,
                    type: type as "Pre-Money" | "Post-Money",
                    discount,
                    shares: 0
                });
            }

            updateSafeNotes(newSafes);
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    const handleDownloadCSV = () => {
        const headers = ['Name,Investment Principal,Valuation Cap,Type,Discount'];
        const rows = safeNotes.map(safe => 
            `${safe.name},${safe.principal},${safe.valuationCap},${safe.type},${safe.discount}`
        );
        const csv = headers.concat(rows).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'safe-notes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>SAFE Notes</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleClear} size="sm" variant="outline">
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
                        Add SAFE
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <EditableTable data={safeNotes} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
            </CardContent>
            {isPopupOpen && (
                <SafeNotePopup safe={editingSafe} onSave={handleSave} onCancel={() => setIsPopupOpen(false)} />
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
