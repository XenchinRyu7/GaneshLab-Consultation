import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseServer
    .from("user_profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("Supabase keep-alive failed:", error);
    return NextResponse.json({ error: "Database keep-alive failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
