import * as Papa from 'papaparse';
interface OriginalProduct {
  Product: string;
  Quantity: string;
  Price: string;
  "Regular Price": string;
  Savings: string;
}

export type Payment = {
  product: string;
  quantity: string;
  price: string;
  regularPrice: string;
  savings: string;
}
//formats the PapaParse JSON keys into readable format for data table
function transformProducts(originalProducts: OriginalProduct[]): Payment[] {
  return originalProducts.map(product => ({
    product: product.Product,
    quantity: product.Quantity,
    price: product.Price,
    regularPrice: product["Regular Price"],
    savings: product.Savings
  }));
}
export const parseCSV = (csvString:string) => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim() === 'N/A' ? null : value
  });
console.log("result:",result.data)
console.log("tranformedData:",transformProducts(result.data as OriginalProduct[]))
return transformProducts(result.data as OriginalProduct[])
};

