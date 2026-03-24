import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not available" },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
