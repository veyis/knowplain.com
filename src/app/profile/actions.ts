"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileName(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to update your profile.");
  }

  const displayName = formData.get("displayName") as string;
  if (!displayName || displayName.trim().length === 0) {
    throw new Error("Display name cannot be empty.");
  }

  const { error } = await supabase
    .from("knowplain_profiles")
    .update({ display_name: displayName.trim() })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile.");
  }

  revalidatePath("/profile");
}

export async function deleteSimulation(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to delete simulations.");
  }

  const { error } = await supabase
    .from("knowplain_saved_simulations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting simulation:", error);
    throw new Error("Failed to delete simulation.");
  }

  revalidatePath("/profile");
}
