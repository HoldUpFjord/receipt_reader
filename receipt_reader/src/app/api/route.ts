import { OpenAI } from "openai";
import { NextRequest,NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req:NextRequest, res:NextResponse) {
const requestBody = await req.json();
console.log("req", requestBody);
try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", 
          content: "You will be provided with OCR outputs of receipt data, and your task is to parse it for the products, price, and other relevant labels to then parse into CSV format." },
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