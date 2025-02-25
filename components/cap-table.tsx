"use client";

import { useCalculation } from "@/context/calculation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function CapTable() {
    const { capTable, updateCapTable } = useCalculation();

    const formatNumber = (value: number) => {
        return value.toLocaleString("en-US");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Cap Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <div className="">
                                    <Tooltip.Trigger asChild>
                                        <Label htmlFor="shares">
                                            Fully Diluted Shares <span>ℹ️</span>
                                        </Label>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content side="right" align="center" className="tooltip-content">
                                        All shares issued and outstanding, including all options.
                                        <Tooltip.Arrow className="tooltip-arrow" />
                                    </Tooltip.Content>
                                </div>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input
                            id="shares"
                            type="text"
                            value={formatNumber(capTable.fullyDilutedShares)}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, ""); // Keep only digits
                                updateCapTable({
                                    ...capTable,
                                    fullyDilutedShares: value === "" ? 0 : Number(value), // Convert empty input to 0
                                });
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <div className="">
                                    <Tooltip.Trigger asChild>
                                        <Label htmlFor="options">
                                            Available Options in Pool <span>ℹ️</span>
                                        </Label>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content side="right" align="center" className="tooltip-content">
                                        Remaining options in pool, included in the fully diluted count.
                                        <Tooltip.Arrow className="tooltip-arrow" />
                                    </Tooltip.Content>
                                </div>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input
                            id="options"
                            type="text"
                            value={formatNumber(capTable.remainingOptions)}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                updateCapTable({
                                    ...capTable,
                                    remainingOptions: value === "" ? 0 : Number(value),
                                });
                            }}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pool-size">New Options Pool Size (%)</Label>
                    <div className="flex items-center space-x-4">
                        <Slider
                            id="pool-size"
                            min={1}
                            max={100}
                            step={1}
                            value={[capTable.newPoolSize]}
                            onValueChange={(value) =>
                                updateCapTable({
                                    ...capTable,
                                    newPoolSize: value[0],
                                })
                            }
                            className="flex-grow"
                        />
                        <span className="w-12 text-right">{capTable.newPoolSize.toFixed(0)}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
