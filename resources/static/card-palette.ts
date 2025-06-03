type Color = {
  bg: string;
  text: string;
  accent: string;
};


const cardPalette: Record<string, Color> = {
  funny: {
    bg: "#1A1C1F",
    accent: "#FACC15",
    text: "#FDE68A",
  },
  professional: {
    bg: "#121417",
    accent: "#3B82F6",
    text: "#BFDBFE",
  },
  invitation: {
    bg: "#16181C",
    accent: "#10B981",
    text: "#6EE7B7",
  },
  romantic: {
    bg: "#181618",
    accent: "#EF4444",
    text: "#FCA5A5",
  },
};


export default Object.freeze(cardPalette);
