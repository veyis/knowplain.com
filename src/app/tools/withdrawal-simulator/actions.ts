"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSimulation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to save simulations." };
  }

  const name = formData.get("name") as string;
  const balance = Number(formData.get("balance"));
  const withdrawal = Number(formData.get("withdrawal"));
  const growth = Number(formData.get("growth"));
  const inflation = Number(formData.get("inflation"));

  if (!name || isNaN(balance) || isNaN(withdrawal) || isNaN(growth) || isNaN(inflation)) {
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
