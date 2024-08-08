import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"
 
async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      product: "FIBER ONE",
      quantity: "2",
      price: "5.00",
      regularPrice: "7.98",
      savings: "2.98"
    }
    // ...
    
  ]
}
 
export default async function DemoPage() {
  const data = await getData()
 
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}