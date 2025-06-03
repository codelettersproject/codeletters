import { SelectItemProps } from "@/components";


const cardCategories: Omit<SelectItemProps, "onClick">[] = [
  {
    label: "🤪 Divertidos / Engraçados",
    value: "funny",
  },
  {
    label: "🤗 Profissional",
    value: "professional",
  },
  {
    label: "📅 Convite",
    value: "invitation",
  },
  {
    label: "❤️ Romântico",
    value: "romantic",
  },
];

export default Object.freeze(cardCategories) as Omit<SelectItemProps, "onClick">[];
