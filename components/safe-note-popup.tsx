"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SafeNote } from "@/context/calculation-context";
import * as Tooltip from "@radix-ui/react-tooltip";
interface SafeNotePopupProps {
    safe: SafeNote | null;
    onSave: (safe: SafeNote) => void;
    onCancel: () => void;
}

export default function SafeNotePopup({ safe, onSave, onCancel }: SafeNotePopupProps) {
    const [editedSafe, setEditedSafe] = useState(
        safe || {
            id: "",
            name: "",
            principal: 0,
            valuationCap: 0,
            type: "Post-Money" as "Post-Money" | "Pre-Money",
            discount: 100,
            shares: 0,
        }
    );

    useEffect(() => {
        if (safe) {
            setEditedSafe(safe);
        }
    }, [safe]);

    const handleChange = (key: string, value: string | number) => {
        setEditedSafe({ ...editedSafe, [key]: value });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(value);
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Manually trigger the form validation
        const form = e.target as HTMLFormElement;

        if (form.checkValidity()) {
            // Proceed with saving if the form is valid
            onSave(editedSafe);
        } else {
            // If validation fails, trigger HTML5 validation error messages
            form.reportValidity();
        }
    };

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{safe ? "Edit SAFE Note" : "Add SAFE Note"}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editedSafe.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="principal">Investment Principal</Label>
                            <Input
                                id="principal"
                                value={editedSafe.principal === 0 ? "" : formatCurrency(editedSafe.principal)}
                                onChange={(e) => {
                                    const value = Number.parseFloat(e.target.value.replace(/[^0-9]/g, ""));
                                    handleChange("principal", isNaN(value) ? 0 : value);
                                }}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="valuationCap">Valuation Cap</Label>
                            <Input
                                id="valuationCap"
                                value={editedSafe.valuationCap === 0 ? "" : formatCurrency(editedSafe.valuationCap)}
                                onChange={(e) => {
                                    const value = Number.parseFloat(e.target.value.replace(/[^0-9]/g, ""));
                                    handleChange("valuationCap", isNaN(value) ? 0 : value);
                                }}
                                required
                            />
                        </div>
                        <div>
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <Label htmlFor="type">
                                            Type
                                            <span>ℹ️</span>
                                        </Label>
                                    </Tooltip.Trigger>

                                    <Tooltip.Content side="right" align="center" className="tooltip-content">
                                        <a
                                            href="https://www.ycombinator.com/documents/"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Post-2018, YC SAFE default is post-money
                                        </a>
                                        <Tooltip.Arrow className="tooltip-arrow" />
                                    </Tooltip.Content>
                                </Tooltip.Root>
                                <Select value={editedSafe.type} onValueChange={(value) => handleChange("type", value)}>
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pre-Money">Pre-Money</SelectItem>
                                        <SelectItem value="Post-Money">Post-Money</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Tooltip.Provider>
                        </div>
                        <div>
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <Label htmlFor="discount">
                                            Discount Ratio (%)
                                            <span>ℹ️</span>
                                        </Label>
                                    </Tooltip.Trigger>

                                    <Tooltip.Content side="right" align="center" className="tooltip-content">
                                        100% = no discount, 90% = 10% discount, etc.
                                        <Tooltip.Arrow className="tooltip-arrow" />
                                    </Tooltip.Content>
                                </Tooltip.Root>

                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={editedSafe.discount}
                                    onChange={(e) => handleChange("discount", Number.parseFloat(e.target.value))}
                                />
                            </Tooltip.Provider>
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
