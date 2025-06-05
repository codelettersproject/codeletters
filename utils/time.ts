export function timeBasedGreeting(language?: Intl.LocalesArgument): string {
  const hours = new Date(Date.now()).getHours();

  let greetingKey: "morning" | "afternoon" | "evening" | "night";

  if(hours >= 5 && hours < 12) {
    greetingKey = "morning";
  } else if(hours >= 12 && hours < 17) {
    greetingKey = "afternoon";
  } else if(hours >= 17 && hours < 21) {
    greetingKey = "evening";
  } else {
    greetingKey = "night";
  }

  const greetings: Record<string, Record<typeof greetingKey, string>> = {
    "en": {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      night: "Good night",
    },
    "es": {
      morning: "Buenos días",
      afternoon: "Buenas tardes",
      evening: "Buenas noches",
      night: "Buenas noches",
    },
    "fr": {
      morning: "Bonjour",
      afternoon: "Bon après-midi",
      evening: "Bonsoir",
      night: "Bonne nuit",
    },
    "de": {
      morning: "Guten Morgen",
      afternoon: "Guten Tag",
      evening: "Guten Abend",
      night: "Gute Nacht",
    },
    "pt": {
      morning: "Bom dia",
      afternoon: "Boa tarde",
      evening: "Boa noite",
      night: "Boa noite",
    },
  };

  const locale = typeof language === "string"
    ? language
    : Array.isArray(language)
      ? language[0]
      : Intl.NumberFormat().resolvedOptions().locale;

  const lang = locale.split("-")[0]; // Extract base language code
  const localizedGreeting = greetings[lang]?.[greetingKey];

  return localizedGreeting ?? greetings["en"][greetingKey]; // fallback to English
}
