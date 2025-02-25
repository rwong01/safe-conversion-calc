"use client";

import { useState } from "react";
import { useCalculation, Column, SafeNote } from "@/context/calculation-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import EditableTable from "./editable-table";
import SafeNotePopup from "./safe-note-popup";

export default function SafeNotes() {
    const { safeNotes, updateSafeNotes } = useCalculation();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingSafe, setEditingSafe] = useState<SafeNote | null>(null);

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
            type: safe.type, // Ensures lowercase
            discount: safe.discount,
            shares: safe.shares ?? 0, // Preserve existing or set default
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>SAFE Notes</CardTitle>
                <div className="flex gap-2">
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
        </Card>
    );
}
