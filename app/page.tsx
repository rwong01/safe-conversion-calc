"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CapTable from "@/components/cap-table"
import SafeNotes from "@/components/safe-notes"
import NewRound from "@/components/new-round"
import Results from "@/components/results"
import { CalculationProvider } from "@/context/calculation-context"

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">SAFE Conversion Calculator</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <CalculationProvider>
          <Tabs defaultValue="cap-table" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cap-table">Current Cap Table</TabsTrigger>
              <TabsTrigger value="safe-notes">SAFE Notes</TabsTrigger>
              <TabsTrigger value="new-round">New Priced Round</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="cap-table">
              <CapTable />
            </TabsContent>
            <TabsContent value="safe-notes">
              <SafeNotes />
            </TabsContent>
            <TabsContent value="new-round">
              <NewRound />
            </TabsContent>
            <TabsContent value="results">
              <Results />
            </TabsContent>
          </Tabs>
        </CalculationProvider>
      </main>
    </div>
  )
}

