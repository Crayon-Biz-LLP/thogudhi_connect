import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta";

const STORAGE_KEY = "ti-lang";

const strings = {
  // Brand
  brand: ["THOGUDHI INAI", "தொகுதி இணை"],
  brandFull: ["தொகுதி இணை | THOGUDHI INAI", "தொகுதி இணை | THOGUDHI INAI"],
  tagline: ["Connecting People • Ideas • Issues • Community", "மக்கள் • கருத்துகள் • பிரச்சினைகள் • சமூகம் — இணைக்கிறோம்"],
  initiative: ["An initiative of We The Leaders – Thousand Lights Constituency", "We The Leaders – ஆயிரம் விளக்கு தொகுதி முன்னெடுப்பு"],
  logoPlaceholder: ["Official logo", "அதிகாரப்பூர்வ சின்னம்"],

  // Nav
  navHome: ["Home", "முகப்பு"],
  navSubmit: ["Submit", "சமர்ப்பிக்க"],
  navTrack: ["Track", "நிலை அறிய"],
  navBoard: ["Community Board", "சமூகப் பலகை"],
  navAbout: ["About", "எங்களைப் பற்றி"],
  navContact: ["Contact", "தொடர்பு"],
  navPrivacy: ["Privacy", "தனியுரிமை"],
  navGuidelines: ["Community Guidelines", "சமூக வழிகாட்டுதல்கள்"],
  navAdmin: ["Team Login", "குழு உள்நுழைவு"],
  menu: ["Menu", "மெனு"],

  // Home
  heroTitle: ["Your neighbourhood. Your voice. One shared board.", "உங்கள் பகுதி. உங்கள் குரல். ஒரே பொதுப் பலகை."],
  heroBody: [
    "Thogudhi Inai is a neutral community space for residents of Thousand Lights to report local issues, ask questions, share ideas and views — and see what the community is raising together.",
    "ஆயிரம் விளக்கு தொகுதி மக்கள் உள்ளூர் பிரச்சினைகளைப் பதிவு செய்யவும், கேள்விகள் கேட்கவும், கருத்துகளையும் யோசனைகளையும் பகிரவும், சமூகம் ஒன்றாக எழுப்பும் விஷயங்களைக் காணவும் ஒரு நடுநிலை சமூகத் தளம்.",
  ],
  ctaIssue: ["Report an Issue", "பிரச்சினையைப் பதிவு செய்"],
  ctaIssueDesc: ["Potholes, streetlights, garbage, water and more", "குழிகள், தெருவிளக்குகள், குப்பை, தண்ணீர் மற்றும் பல"],
  ctaQuestion: ["Ask a Question", "கேள்வி கேள்"],
  ctaQuestionDesc: ["Something about your locality you want to understand", "உங்கள் பகுதி குறித்து அறிய விரும்பும் ஏதேனும்"],
  ctaIdea: ["Share an Idea", "யோசனையைப் பகிர்"],
  ctaIdeaDesc: ["A suggestion to make the neighbourhood better", "பகுதியை மேம்படுத்த ஒரு பரிந்துரை"],
  ctaView: ["Share Your View", "உங்கள் கருத்தைப் பகிர்"],
  ctaViewDesc: ["Your perspective on a local matter", "ஒரு உள்ளூர் விஷயம் குறித்த உங்கள் பார்வை"],
  trackCta: ["Track a submission", "சமர்ப்பிப்பின் நிலையை அறிய"],
  boardCta: ["See the Community Board", "சமூகப் பலகையைப் பார்"],
  howTitle: ["How it works", "இது எப்படி செயல்படுகிறது"],
  how1T: ["Share", "பகிர்"],
  how1B: ["Tell us what you've noticed. Your contact details stay private.", "நீங்கள் கவனித்ததைச் சொல்லுங்கள். உங்கள் தொடர்பு விவரங்கள் ரகசியமாகவே இருக்கும்."],
  how2T: ["Reference ID", "குறிப்பு எண்"],
  how2B: ["You receive an ID like WTL-TL-2026-0001 to track progress anytime.", "WTL-TL-2026-0001 போன்ற எண்ணைப் பெற்று எப்போதும் நிலையை அறியலாம்."],
  how3T: ["Community", "சமூகம்"],
  how3B: ["Volunteers review it. Approved summaries appear on the public board.", "தன்னார்வலர்கள் ஆய்வு செய்வர். ஒப்புதல் பெற்ற சுருக்கங்கள் பொதுப் பலகையில் தோன்றும்."],
  neutralNote: ["A neutral, non-partisan community initiative. Not a government portal.", "நடுநிலை, கட்சி சார்பற்ற சமூக முன்னெடுப்பு. அரசு தளம் அல்ல."],
  recentTitle: ["Recently on the Community Board", "சமூகப் பலகையில் சமீபத்தில்"],
  viewAll: ["View all", "அனைத்தையும் காண்"],

  // Form
  formTitle: ["Make a submission", "சமர்ப்பிப்பு செய்யுங்கள்"],
  formIntro: ["Fields marked * are required. Contact details are optional and never shown publicly.", "* குறியிட்ட புலங்கள் அவசியம். தொடர்பு விவரங்கள் விருப்பத்தேர்வு; பொதுவில் காட்டப்படாது."],
  fType: ["What would you like to share?", "நீங்கள் எதைப் பகிர விரும்புகிறீர்கள்?"],
  fName: ["Your name", "உங்கள் பெயர்"],
  fOptional: ["optional", "விருப்பம்"],
  fLocality: ["Locality / Area", "பகுதி / இடம்"],
  fLocalityPh: ["e.g. Nungambakkam, Royapettah", "எ.கா. நுங்கம்பாக்கம், ராயப்பேட்டை"],
  fWard: ["Ward number", "வார்டு எண்"],
  fCategory: ["Category", "வகை"],
  fSelect: ["Select", "தேர்வு செய்"],
  fSubject: ["Subject", "தலைப்பு"],
  fSubjectPh: ["Short title, e.g. Streetlight not working near bus stop", "சுருக்கமான தலைப்பு, எ.கா. பேருந்து நிறுத்தம் அருகே தெருவிளக்கு எரியவில்லை"],
  fDescription: ["Description", "விவரம்"],
  fDescriptionPh: ["Describe what you noticed, since when, and how it affects people.", "நீங்கள் கவனித்தது, எப்போதிலிருந்து, மக்களை எப்படிப் பாதிக்கிறது என்பதை விவரிக்கவும்."],
  fLandmark: ["Landmark / Location", "அடையாள இடம் / இருப்பிடம்"],
  fLandmarkPh: ["Street name, nearby landmark", "தெருப் பெயர், அருகிலுள்ள அடையாளம்"],
  fImage: ["Photo", "புகைப்படம்"],
  fImageHint: ["JPG, PNG or WebP, up to 5 MB", "JPG, PNG அல்லது WebP, 5 MB வரை"],
  fPhone: ["Phone", "தொலைபேசி"],
  fEmail: ["Email", "மின்னஞ்சல்"],
  fContact: ["Preferred contact method", "விரும்பும் தொடர்பு முறை"],
  cNone: ["No contact needed", "தொடர்பு தேவையில்லை"],
  cPhone: ["Phone call", "தொலைபேசி அழைப்பு"],
  cWhatsapp: ["WhatsApp", "வாட்ஸ்அப்"],
  cEmail: ["Email", "மின்னஞ்சல்"],
  fConsent: [
    "I agree to the Community Guidelines and Privacy Policy. I understand a sanitized summary (without my contact details) may be shown publicly after moderation.",
    "சமூக வழிகாட்டுதல்கள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கிறேன். மதிப்பாய்வுக்குப் பிறகு (என் தொடர்பு விவரங்கள் இல்லாமல்) சுருக்கம் பொதுவில் காட்டப்படலாம் என்பதை அறிவேன்.",
  ],
  fSubmit: ["Submit", "சமர்ப்பி"],
  fSubmitting: ["Submitting…", "சமர்ப்பிக்கப்படுகிறது…"],
  fPrivacyNote: ["Private details are visible only to the authorised moderation team.", "தனிப்பட்ட விவரங்கள் அங்கீகரிக்கப்பட்ட மதிப்பாய்வுக் குழுவிற்கு மட்டுமே தெரியும்."],
  fError: ["Something went wrong. Please try again.", "ஏதோ தவறு நேர்ந்தது. மீண்டும் முயற்சிக்கவும்."],

  // Confirmation
  confTitle: ["Thank you — we've received it", "நன்றி — பெறப்பட்டது"],
  confBody: ["Save your reference ID. Use it any time to check progress.", "உங்கள் குறிப்பு எண்ணைச் சேமிக்கவும். நிலையை அறிய எப்போதும் பயன்படுத்தலாம்."],
  confRef: ["Your reference ID", "உங்கள் குறிப்பு எண்"],
  confPrivateCode: ["Private tracking code — keep this safe", "தனிப்பட்ட கண்காணிப்புக் குறியீடு — பாதுகாப்பாக வைத்திருங்கள்"],
  confCopy: ["Copy", "நகலெடு"],
  confCopied: ["Copied", "நகலெடுக்கப்பட்டது"],
  confNext: ["What happens next", "அடுத்து என்ன நடக்கும்"],
  confNext1: ["A volunteer reviews your submission.", "ஒரு தன்னார்வலர் உங்கள் சமர்ப்பிப்பை மதிப்பாய்வு செய்வார்."],
  confNext2: ["If approved, a sanitized summary appears on the Community Board.", "ஒப்புதல் பெற்றால், சுருக்கம் சமூகப் பலகையில் தோன்றும்."],
  confNext3: ["Where appropriate, it may be brought to the attention of relevant authorities.", "தேவைப்பட்டால், உரிய அதிகாரிகளின் கவனத்திற்கு கொண்டு செல்லப்படலாம்."],
  confTrack: ["Track this submission", "இந்த சமர்ப்பிப்பை கண்காணி"],
  confAnother: ["Make another submission", "மற்றொரு சமர்ப்பிப்பு"],

  // Track
  trackTitle: ["Track a submission", "சமர்ப்பிப்பின் நிலை"],
  trackIntro: ["Enter your reference ID and private tracking code.", "உங்கள் குறிப்பு எண்ணையும் தனிப்பட்ட கண்காணிப்புக் குறியீட்டையும் உள்ளிடவும்."],
  trackCode: ["Private tracking code", "தனிப்பட்ட கண்காணிப்புக் குறியீடு"],
  trackCodePh: ["Private tracking code", "தனிப்பட்ட கண்காணிப்புக் குறியீடு"],
  trackBtn: ["Check status", "நிலையைப் பார்"],
  trackNotFound: ["No submission found with that reference ID.", "அந்த குறிப்பு எண்ணுடன் சமர்ப்பிப்பு எதுவும் இல்லை."],
  trackSubmitted: ["Submitted", "சமர்ப்பிக்கப்பட்டது"],
  trackStatus: ["Current status", "தற்போதைய நிலை"],
  trackTimeline: ["Progress", "முன்னேற்றம்"],
  trackUpdates: ["Public updates", "பொது புதுப்பிப்புகள்"],
  trackNoUpdates: ["No public updates yet.", "இன்னும் பொது புதுப்பிப்புகள் இல்லை."],
  trackPublic: ["This submission is on the Community Board.", "இந்த சமர்ப்பிப்பு சமூகப் பலகையில் உள்ளது."],

  // Board
  boardTitle: ["Community Board", "சமூகப் பலகை"],
  boardIntro: ["Moderated, sanitized summaries of what residents are raising. No personal details are shown.", "மக்கள் எழுப்பும் விஷயங்களின் மதிப்பாய்வு செய்யப்பட்ட சுருக்கங்கள். தனிப்பட்ட விவரங்கள் காட்டப்படாது."],
  filterAll: ["All", "அனைத்தும்"],
  filterType: ["Type", "வகை"],
  filterCategory: ["Category", "பிரிவு"],
  filterStatus: ["Status", "நிலை"],
  search: ["Search", "தேடு"],
  searchPh: ["Search by subject, locality or ID", "தலைப்பு, பகுதி அல்லது எண் மூலம் தேடு"],
  boardEmpty: ["Nothing here yet. Approved submissions will appear once reviewed.", "இன்னும் எதுவும் இல்லை. மதிப்பாய்வுக்குப் பின் ஒப்புதல் பெற்ற சமர்ப்பிப்புகள் இங்கே தோன்றும்."],
  demo: ["DEMO", "மாதிரி"],
  results: ["results", "முடிவுகள்"],

  // Types
  tIssue: ["Issue", "பிரச்சினை"],
  tQuestion: ["Question", "கேள்வி"],
  tIdea: ["Idea", "யோசனை"],
  tView: ["View", "கருத்து"],

  // Footer
  footerDisclaimer: [
    "Thogudhi Inai is a community engagement initiative of We The Leaders – Thousand Lights Constituency. It is not an official government grievance portal. Where appropriate, issues may be brought to the attention of the relevant authorities.",
    "தொகுதி இணை என்பது We The Leaders – ஆயிரம் விளக்கு தொகுதியின் சமூக ஈடுபாட்டு முன்னெடுப்பு. இது அதிகாரப்பூர்வ அரசு குறைதீர்ப்புத் தளம் அல்ல. தேவைப்படும் இடங்களில், பிரச்சினைகள் உரிய அதிகாரிகளின் கவனத்திற்கு கொண்டு செல்லப்படலாம்.",
  ],
  footerLinks: ["Links", "இணைப்புகள்"],
  footerPolicies: ["Policies", "கொள்கைகள்"],
  language: ["Language", "மொழி"],

  // Auth
  authTitle: ["Team sign in", "குழு உள்நுழைவு"],
  authIntro: ["For authorised volunteers and moderators only.", "அங்கீகரிக்கப்பட்ட தன்னார்வலர்கள் மற்றும் மதிப்பாய்வாளர்களுக்கு மட்டும்."],
  authEmail: ["Email", "மின்னஞ்சல்"],
  authPassword: ["Password", "கடவுச்சொல்"],
  authSignIn: ["Sign in", "உள்நுழை"],
  authSignUp: ["Create account", "கணக்கை உருவாக்கு"],
  authToggleUp: ["Need an account? Create one", "கணக்கு தேவையா? உருவாக்கு"],
  authToggleIn: ["Already have an account? Sign in", "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழை"],
  authName: ["Display name", "காட்சிப் பெயர்"],
  authCheckEmail: ["Check your email to confirm your account, then sign in.", "உங்கள் மின்னஞ்சலைச் சரிபார்த்து கணக்கை உறுதிசெய்து, பின்னர் உள்நுழையவும்."],
  authNoRole: ["Your account has no team role yet. Ask an administrator to grant access.", "உங்கள் கணக்கிற்கு இன்னும் குழுப் பங்கு இல்லை. அணுகல் வழங்க நிர்வாகியிடம் கேளுங்கள்."],
  signOut: ["Sign out", "வெளியேறு"],
} as const;

export type StringKey = keyof typeof strings;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => strings[k][0],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ta" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: StringKey) => strings[key][lang === "ta" ? 1 : 0];

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
