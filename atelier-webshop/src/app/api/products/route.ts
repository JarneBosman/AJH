import { getAllProducts } from "@/lib/products-repository";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
