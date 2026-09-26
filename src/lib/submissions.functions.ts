import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PUBLIC_ID_RE } from "@/lib/constants";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const submissionSchema = z.object({
  type: z.enum(["issue", "question", "idea", "view"]),
  name: z.string().trim().max(100).optional().or(z.literal("")),
  locality: z.string().trim().min(2).max(120),
  ward: z.string().trim().max(20).optional().or(z.literal("")),
  category: z.enum([
    "roads", "streetlights", "garbage", "water", "sewerage", "traffic", "parks",
    "education", "senior_citizens", "accessibility", "environment", "public_safety", "other",
  ]),
  subject: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(3000),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(20).regex(/^[+\d\s-]*$/).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  preferred_contact: z.enum(["none", "phone", "email", "whatsapp"]),
  consent: z.literal(true),
  website: z.string().max(0), // honeypot — must be empty
});

async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((input: FormData) => {
    if (!(input instanceof FormData)) throw new Error("Invalid form");
    const raw: Record<string, unknown> = {};
    for (const key of Object.keys(submissionSchema.shape)) {
      const v = input.get(key);
      raw[key] = key === "consent" ? v === "true" : typeof v === "string" ? v : "";
    }
    const parsed = submissionSchema.parse(raw);
    const image = input.get("image");
    const file = image instanceof File && image.size > 0 ? image : null;
    if (file) {
      if (!ALLOWED_MIME.includes(file.type)) throw new Error("Unsupported image type");
      if (file.size > MAX_IMAGE_BYTES) throw new Error("Image too large");
    }
    return { ...parsed, file };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Basic anti-spam: max 5 submissions per IP per hour
    const request = getRequest();
    const ip =
      request?.headers.get("cf-connecting-ip") ??
      request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const ipHash = await sha256(ip + (process.env["SUPABASE_PROJECT_ID"] ?? "ti"));
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("submission_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) throw new Error("Too many submissions. Please try again later.");

    const { file, website: _hp, ...fields } = data;
    const { data: row, error } = await supabaseAdmin
      .from("submissions")
      .insert({
        public_id: "",
        year: 0,
        seq: 0,
        type: fields.type,
        name: fields.name || null,
        locality: fields.locality,
        ward: fields.ward || null,
        category: fields.category,
        subject: fields.subject,
        description: fields.description,
        landmark: fields.landmark || null,
        phone: fields.phone || null,
        email: fields.email || null,
        preferred_contact: fields.preferred_contact,
        consent: true,
      })
      .select("id, public_id, tracking_token")
      .single();
    if (error || !row) throw new Error("Could not save submission");

    await supabaseAdmin.from("submission_rate_limits").insert({ ip_hash: ipHash });

    if (file) {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${row.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("submission-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (!upErr) {
        await supabaseAdmin.from("attachments").insert({
          submission_id: row.id,
          storage_path: path,
          mime_type: file.type,
          size_bytes: file.size,
        });
      }
    }

    return { publicId: row.public_id, trackingToken: row.tracking_token };
  });

export const trackSubmission = createServerFn({ method: "GET" })
  .inputValidator((input: { publicId: string; trackingToken: string }) => {
    const id = input.publicId.trim().toUpperCase();
    if (!PUBLIC_ID_RE.test(id)) throw new Error("Invalid reference ID");
    const trackingToken = z.string().uuid().parse(input.trackingToken.trim());
    return { publicId: id, trackingToken };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin
      .from("submissions")
      .select("id, public_id, type, category, status, created_at, locality, is_demo")
      .eq("public_id", data.publicId)
      .eq("tracking_token", data.trackingToken)
      .maybeSingle();
    if (!sub) return null;

    const [{ data: history }, { data: notes }, { data: pub }] = await Promise.all([
      supabaseAdmin
        .from("submission_history")
        .select("to_status, created_at")
        .eq("submission_id", sub.id)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("submission_notes")
        .select("body, created_at")
        .eq("submission_id", sub.id)
        .eq("is_public", true)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("submission_public")
        .select("public_title, is_published")
        .eq("submission_id", sub.id)
        .maybeSingle(),
    ]);

    return {
      publicId: sub.public_id,
      type: sub.type,
      category: sub.category,
      status: sub.status,
      createdAt: sub.created_at,
      locality: sub.locality,
      isDemo: sub.is_demo,
      history: history ?? [],
      publicNotes: notes ?? [],
      publicTitle: pub?.is_published ? pub.public_title : null,
    };
  });

export const getAttachmentUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string }) => z.object({ submissionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // RLS on attachments decides whether this user may see them
    const { data: rows, error } = await context.supabase
      .from("attachments")
      .select("id, storage_path, mime_type, size_bytes")
      .eq("submission_id", data.submissionId);
    if (error) throw new Error(error.message);
    if (!rows?.length) return [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed } = await supabaseAdmin.storage
      .from("submission-images")
      .createSignedUrls(rows.map((r) => r.storage_path), 600);
    return rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl ?? null }));
  });
