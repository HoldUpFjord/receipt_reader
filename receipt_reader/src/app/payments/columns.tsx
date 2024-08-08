"use client"
 
import { ColumnDef } from "@tanstack/react-table"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  product: string
  quantity: string
  price:string
  regularPrice: string
  savings: string
}
 
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "product",
    header: "Product",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "price",
    header: "Price",
  }, {
    accessorKey: "regualrPrice",
    header: "Regular Price",
  }, {
    accessorKey: "savings",
    header: "Savings",
  },
]