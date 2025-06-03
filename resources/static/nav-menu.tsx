import { IMenuEntry } from "@/_types";


const navMenu: IMenuEntry[] = [
  {
    label: "Página Inicial",
    icon: "home",
    path: "/dashboard",
  },
  {
    label: "Meus Cartões",
    icon: "stories",
    path: "/dashboard/card",
    routerMath: /\/dashboard\/card(.*)/,
  },
  {
    label: "Novo Cartão",
    icon: "add-box",
    path: "/dashboard/setup-card",
    routerMath: /\/dashboard\/setup-card(.*)/,
  },
];

export default Object.freeze(navMenu);
