"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Investor } from "@/context/calculation-context";
interface NewRoundInvestorPopupProps {
    investor: Investor | null;
    onSave: (investor: Investor) => void;
    onCancel: () => void;
}

export default function NewRoundInvestorPopup({ investor, onSave, onCancel }: NewRoundInvestorPopupProps) {
    const [editedInvestor, setEditedInvestor] = useState(
        investor || {
            id: "",
            name: "",
            principal: 0,
            shares: 0,
        }
    );

    useEffect(() => {
        if (investor) {
            setEditedInvestor(investor);
        }
    }, [investor]);

    const handleChange = (key: string, value: string | number) => {
        setEditedInvestor({ ...editedInvestor, [key]: value });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
            value
        );
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Manually trigger the form validation
        const form = e.target as HTMLFormElement;

        if (form.checkValidity()) {
            // Proceed with saving if the form is valid
            onSave(editedInvestor);
        } else {
            // If validation fails, trigger HTML5 validation error messages
            form.reportValidity();
        }
    };
    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{investor ? "Edit Investor" : "Add Investor"}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editedInvestor.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="principal">Investment Principal</Label>
                            <Input
                                id="principal"
                                value={editedInvestor.principal === 0 ? "" : formatCurrency(editedInvestor.principal)}
                                onChange={(e) => {
                                    const value = Number.parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                    handleChange("principal", isNaN(value) ? 0 : value);
                                }}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={onCancel} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
