"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSimulation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to save simulations." };
  }

  const name = String(formData.get("name") || "").trim();
  const balance = Number(formData.get("balance"));
  const withdrawal = Number(formData.get("withdrawal"));
  const growth = Number(formData.get("growth"));
  const inflation = Number(formData.get("inflation"));

  if (
    !name ||
    name.length > 48 ||
    !Number.isFinite(balance) || balance < 0 || balance > 50_000_000 ||
    !Number.isFinite(withdrawal) || withdrawal < 0 || withdrawal > 5_000_000 ||
    !Number.isFinite(growth) || growth < -20 || growth > 20 ||
    !Number.isFinite(inflation) || inflation < 0 || inflation > 20
  ) {
    return { error: "Invalid simulation data." };
  }

  const { error } = await supabase.from("knowplain_saved_simulations").insert({
    user_id: user.id,
    name,
    balance,
    withdrawal,
    growth,
    inflation,
  });

  if (error) {
    console.error("Error saving simulation:", error);
    return { error: "Failed to save simulation." };
  }

  revalidatePath("/tools/withdrawal-simulator");
  return { success: true };
}
