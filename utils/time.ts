export type RelativeTime = `${number}${"s" | "m" | "h" | "d" | "w" | "M" | "y"}`;

export const relativeTimePattern = /^\d+(s|m|h|d|w|M|y)$/;


/**
 * Parses a relative time string (e.g., "5m", "2h") and returns the Date object from now.
 * @param {RelativeTime} relativeTime - The relative time string.
 * @returns {Date} The Date object.
 */
export function parseRelativeTime(relativeTime: RelativeTime): Date {
  if(!relativeTimePattern.test(relativeTime)) {
    throw new TypeError("Invalid relative time format");
  }
    
  const value = parseInt(relativeTime.slice(0, -1), 10);
  const unit = relativeTime.slice(-1);
    
  const date = new Date();

  switch(unit) {
    case "s":
      date.setSeconds(date.getSeconds() + value);
      break;
    case "m":
      date.setMinutes(date.getMinutes() + value);
      break;
    case "h":
      date.setHours(date.getHours() + value);
      break;
    case "d":
      date.setDate(date.getDate() + value);
      break;
    case "w":
      date.setDate(date.getDate() + value * 7);
      break;
    case "M":
      date.setMonth(date.getMonth() + value);
      break;
    case "y":
      date.setFullYear(date.getFullYear() + value);
      break;
  }
    
  return date;
}


/**
 * Parses a relative time string and returns the Date object from a given epoch.
 * @param {RelativeTime} relativeTime - The relative time string.
 * @param {number} epoch - The reference timestamp in milliseconds.
 * @returns {Date} The computed Date object.
 */
export function parseRelativeTimeFromEpoch(relativeTime: RelativeTime, epoch: number): Date {
  if (!relativeTimePattern.test(relativeTime)) {
    throw new TypeError("Invalid relative time format");
  }
    
  const value = parseInt(relativeTime.slice(0, -1), 10);
  const unit = relativeTime.slice(-1);
    
  const date = new Date(epoch);

  switch(unit) {
    case "s":
      date.setSeconds(date.getSeconds() + value);
      break;
    case "m":
      date.setMinutes(date.getMinutes() + value);
      break;
    case "h":
      date.setHours(date.getHours() + value);
      break;
    case "d":
      date.setDate(date.getDate() + value);
      break;
    case "w":
      date.setDate(date.getDate() + value * 7);
      break;
    case "M":
      date.setMonth(date.getMonth() + value);
      break;
    case "y":
      date.setFullYear(date.getFullYear() + value);
      break;
  }
    
  return date;
}


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
