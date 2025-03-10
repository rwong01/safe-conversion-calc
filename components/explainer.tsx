"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
export default function SafeConversionExplainer() {
  return (
        <Card>
            <CardHeader>
                <CardTitle>How SAFE Notes Are Converted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-40">
                <p> 
                    Converting SAFE notes into equity during a priced round requires an <strong>iterative</strong> process since there is no closed-form solution.
                    The cap table is recalculated multiple times until share prices stabilize. Unless you have specific terms otherwise, the general flow and order of dilution is SAFE conversion, ESOP expansion, and then new investor allocation.
                </p>
      <ul className="list-decimal space-y-4">
      
          <Card className="p-4">
            <strong>Step 0: Initialize Variables</strong> 
            <ul className="list-disc pl-10">
              <li> Pre-money valuation of new round <InlineMath math="V_{\text{pre}}"/> (or <InlineMath math="V_{\text{post}} - \sum{P_{\text{new}}}"/>) </li>
              <li> Fully diluted shares <InlineMath math="S_{\text{FD}}"/> </li>
              <li> SAFE notes with principal <InlineMath math="P_{\text{SAFE}}"/>, discount <InlineMath math="d"/>, valuation cap <InlineMath math="V_{\text{cap}}"/> </li>
            </ul>
          </Card>

          <Card className="p-4">
            <strong>Step 1  : Calculate New Share Price</strong>
            <BlockMath math="\text{SP} = \frac{V_{\text{pre}}}{S_{\text{post-ESOP}}}" />
          </Card>

          <Card className="p-4">
            <strong>Step 2: Adjust ESOP Pool</strong>
            <BlockMath math="\text{ESOP Expansion} = \max(0, \frac{\text{Target ESOP \%} \times S_{\text{post-round}}}{100} - \text{Existing ESOP})" />
          </Card>

          <Card className="p-4">
            <strong>Step 3: Convert SAFE Notes</strong> 
            <p>Each SAFE note converts at the better of:</p>
            <ul className="list-none pl-6" >

              <li>
                <strong>Pre-Money SAFE:</strong>
                <BlockMath math="S_{\text{pre-money}} = \frac{P_{\text{SAFE}}}{V_{\text{discounted}} / (S_{\text{FD}} + \text{ESOP Expansion})}" />
              </li>
              <li>
                <strong>Post-Money SAFE:</strong>
                <BlockMath math="S_{\text{post-money}} = \frac{P_{\text{SAFE}}}{V_{\text{discounted}} / S_{\text{post-SAFE}}}" />
              </li>
              <li>
                <strong>New Round Price:</strong>
                <BlockMath math="S_{\text{new-price}} = \frac{P_{\text{SAFE}}}{\text{SP}}" />
              </li>
              where <InlineMath math="V_{\text{discounted}}"/> = <InlineMath math="V_{\text{cap}}"/> * (1 - <InlineMath math="\frac{d}{100}"/>)
            </ul>
          </Card>

          <Card className="p-4">
            <strong>Step 4: Update Shares After SAFE Conversion</strong>
            <BlockMath math="S_{\text{post-SAFE}} = S_{\text{FD}} + \sum S_{\text{SAFE}}" />
          </Card>

          <Card className="p-4">
            <strong>Step 5: Update Shares After ESOP Expansion</strong>
            <BlockMath math="S_{\text{post-ESOP}} = S_{\text{post-SAFE}} + \text{ESOP Expansion}" />
          </Card>

          <Card className="p-4">
            <strong>Step 6: Allocate New Investor Shares</strong>
            <p>For each new investor with principal <InlineMath math="P_{\text{new}}"/>, calculate their shares:</p>
            <BlockMath math="S_{\text{investor}} = \frac{P_{\text{new}}}{\text{SP}}" />
          </Card>
          <Card className="p-4">
            <strong>Step 7: Update Shares After New Investor Allocation</strong>
            <BlockMath math="S_{\text{post-round}} = S_{\text{post-ESOP}} + \sum S_{\text{investor}}" />
          </Card>
          <Card className="p-4">
            <strong>Step 8: Check for Convergence</strong>
            <p>For some error threshold <InlineMath math="\epsilon"/> (e.g. 0.00001),</p>
            <BlockMath math="| \text{SP}^{\text{new}} - \text{SP}^{\text{prev}} | < \epsilon" />
            <p>Iterate until the share price converges.</p>
          </Card>
      </ul>
      </CardContent>
    </Card> 
  );
};
