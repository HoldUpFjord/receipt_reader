import { OpenAI } from "openai";
import { NextRequest,NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
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

function transformProducts(originalProducts: OriginalProduct[]): Payment[] {
  return originalProducts.map(product => ({
    product: product.Product,
    quantity: product.Quantity,
    price: product.Price,
    regularPrice: product["Regular Price"],
    savings: product.Savings
  }));
}
export async function POST(req:NextRequest, res:NextResponse) {
const requestBody = await req.json();
console.log("req", requestBody);
try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", 
          content: "You will be provided with OCR outputs of receipt data, and your task is to parse it for the Product, Quantity, Price, Regular Price, and Savings to then parse into CSV format." },
        {
          "role": "user",
          "content": `${requestBody.text}`,
        }],
      model: "gpt-4o-mini",
    });

    return NextResponse.json(completion.choices[0], { status: 200 });
}  catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}