import type { Database } from "@/integrations/supabase/types";

export type SubmissionType = Database["public"]["Enums"]["submission_type"];
export type SubmissionStatus = Database["public"]["Enums"]["submission_status"];
export type SubmissionCategory = Database["public"]["Enums"]["submission_category"];
export type ContactMethod = Database["public"]["Enums"]["contact_method"];
export type ModerationStatus = Database["public"]["Enums"]["moderation_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

type Bi = readonly [string, string];

export const TYPES: Record<SubmissionType, Bi> = {
  issue: ["Issue", "பிரச்சினை"],
  question: ["Question", "கேள்வி"],
  idea: ["Idea", "யோசனை"],
  view: ["View", "கருத்து"],
};

export const TYPE_ORDER: SubmissionType[] = ["issue", "question", "idea", "view"];

export const STATUSES: Record<SubmissionStatus, Bi> = {
  received: ["Received", "பெறப்பட்டது"],
  under_review: ["Under Review", "மதிப்பாய்வில்"],
  referred: ["Referred / Action Initiated", "பரிந்துரைக்கப்பட்டது / நடவடிக்கை தொடங்கியது"],
  awaiting_update: ["Awaiting Update", "புதுப்பிப்புக்காக காத்திருக்கிறது"],
  resolved: ["Resolved", "தீர்க்கப்பட்டது"],
  closed: ["Closed", "மூடப்பட்டது"],
};

export const STATUS_ORDER: SubmissionStatus[] = [
  "received",
  "under_review",
  "referred",
  "awaiting_update",
  "resolved",
  "closed",
];

export const CATEGORIES: Record<SubmissionCategory, Bi> = {
  roads: ["Roads & Potholes", "சாலைகள் & குழிகள்"],
  streetlights: ["Streetlights", "தெருவிளக்குகள்"],
  garbage: ["Garbage & Sanitation", "குப்பை & சுகாதாரம்"],
  water: ["Water Supply", "குடிநீர் வழங்கல்"],
  sewerage: ["Sewerage & Drainage", "கழிவுநீர் & வடிகால்"],
  traffic: ["Traffic & Road Safety", "போக்குவரத்து & சாலைப் பாதுகாப்பு"],
  parks: ["Parks & Public Spaces", "பூங்காக்கள் & பொது இடங்கள்"],
  education: ["Education", "கல்வி"],
  senior_citizens: ["Senior Citizens", "மூத்த குடிமக்கள்"],
  accessibility: ["Accessibility", "அணுகல்தன்மை"],
  environment: ["Environment & Trees", "சுற்றுச்சூழல் & மரங்கள்"],
  public_safety: ["Public Safety", "பொதுப் பாதுகாப்பு"],
  other: ["Other", "மற்றவை"],
};

export const CATEGORY_ORDER: SubmissionCategory[] = [
  "roads",
  "streetlights",
  "garbage",
  "water",
  "sewerage",
  "traffic",
  "parks",
  "education",
  "senior_citizens",
  "accessibility",
  "environment",
  "public_safety",
  "other",
];

export const CONTACT_METHODS: Record<ContactMethod, Bi> = {
  none: ["No contact needed", "தொடர்பு தேவையில்லை"],
  phone: ["Phone call", "தொலைபேசி அழைப்பு"],
  whatsapp: ["WhatsApp", "வாட்ஸ்அப்"],
  email: ["Email", "மின்னஞ்சல்"],
};

export const STATUS_TONE: Record<SubmissionStatus, string> = {
  received: "bg-secondary text-secondary-foreground",
  under_review: "bg-info/15 text-info",
  referred: "bg-marigold/25 text-marigold-foreground",
  awaiting_update: "bg-warning/20 text-warning-foreground",
  resolved: "bg-success/15 text-success",
  closed: "bg-muted text-muted-foreground",
};

export const PUBLIC_ID_RE = /^WTL-TL-\d{4}-\d{4}$/;

export const bi = (pair: Bi, lang: "en" | "ta") => (lang === "ta" ? pair[1] : pair[0]);
