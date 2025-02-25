"use client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash } from "lucide-react"
import {Column, SafeNote, Investor } from "@/context/calculation-context"

interface EditableTableProps {
  data: SafeNote[] | Investor[]
  columns: Column[]
  onEdit: ((row: SafeNote) => void) | ((row: Investor) => void)
  onDelete: (id: string) => void
}

export default function EditableTable({ data, columns, onEdit, onDelete }: EditableTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
  }

 const formatValue = (value: string | number, type: string) => {
     if (typeof value === "number" && type === "currency") {
         return formatCurrency(value);
     }
     return value; // Return as is if it's a string
 };

const isSafeNote = (row: SafeNote | Investor): row is SafeNote => {
    return (row as SafeNote).valuationCap !== undefined; // Adjust based on a unique field
};
  return (
      <Table>
          <TableHeader>
              <TableRow>
                  {columns.map((column) => (
                      <TableHead key={column.key}>{column.header}</TableHead>
                  ))}
                  <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {data.map((row) => (
                  <TableRow key={row.id}>
                      {columns.map((column) => (
                          <TableCell key={column.key}>
                              {" "}
                              {formatValue(row[column.key as keyof SafeNote & keyof Investor], column.type)}
                          </TableCell>
                      ))}
                      <TableCell>
                          <div className="flex space-x-2">
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                      if (isSafeNote(row)) {
                                          (onEdit as (row: SafeNote) => void)(row);
                                      } else {
                                          (onEdit as (row: Investor) => void)(row);
                                      }
                                  }}
                              >
                                  <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
                                  <Trash className="h-4 w-4" />
                              </Button>
                          </div>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
      </Table>
  );
}
