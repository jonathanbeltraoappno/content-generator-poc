"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["draft", "in_review", "approved", "rejected"] as const;

export async function updateVariantStatusAction(formData: FormData) {
  const variantId = (formData.get("variantId") as string)?.trim();
  const status = (formData.get("status") as string)?.trim();

  if (!variantId || !status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_variants")
    .update({ status })
    .eq("id", variantId);

  if (!error) {
    revalidatePath("/review");
    revalidatePath("/export");
  }
}
