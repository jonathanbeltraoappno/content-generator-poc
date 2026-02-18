"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createContentAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const brand = (formData.get("brand") as string)?.trim() || null;
  const campaign = (formData.get("campaign") as string)?.trim() || null;

  if (!title || !body) {
    redirect("/library/new?error=" + encodeURIComponent("Title and body are required."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("approved_content").insert({
    user_id: user.id,
    title,
    body,
    brand,
    campaign,
  });

  if (error) {
    redirect("/library/new?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/library");
  redirect("/library");
}

export async function updateContentAction(formData: FormData) {
  const contentId = (formData.get("contentId") as string)?.trim();
  if (!contentId) {
    redirect("/library");
  }
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const brand = (formData.get("brand") as string)?.trim() || null;
  const campaign = (formData.get("campaign") as string)?.trim() || null;

  if (!title || !body) {
    redirect(`/library/${contentId}/edit?error=${encodeURIComponent("Title and body are required.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("approved_content")
    .update({ title, body, brand, campaign })
    .eq("id", contentId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/library/${contentId}/edit?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/library");
  revalidatePath(`/library/${contentId}/edit`);
  redirect("/library");
}
