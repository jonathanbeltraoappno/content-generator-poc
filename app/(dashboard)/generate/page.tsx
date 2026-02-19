import { createClient } from "@/lib/supabase/server";
import { HealthCheck } from "@/components/health-check";
import { GenerateForm } from "./generate-form";

export default async function GeneratePage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("approved_content")
    .select("id, title")
    .order("title");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Generate Variants</h1>
      <p className="text-muted-foreground mt-1">
        Select approved content and options, then generate channel-appropriate variants via n8n.
      </p>
      <HealthCheck />
      <GenerateForm contentOptions={items ?? []} className="mt-6 max-w-xl" />
    </div>
  );
}
