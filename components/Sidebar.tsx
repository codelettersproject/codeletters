import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { ssrSafeWindow } from "typesdk/ssr";
import React, { memo, useEffect, useState } from "react";

import Logo from "./Logo";
import Icon from "./Icon";
import Button from "./Button";
import { Typography } from "./modular";
import { useAuth } from "@/context/auth";
import { cn, useIsMobile } from "@/utils";
import { clampLine } from "@/styles/theme";
import type { IMenuEntry } from "@/_types";
import Dropdown, { DropdownItem } from "./Dropdown";
import { setIsSidebarOpen, useAppState } from "@/redux/features/appState";


const Sidebar = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const { user } = useAuth();
  const { isSidebarOpen } = useAppState();
  const { asPath, push: navigate } = useRouter();

  const [state, setState] = useState({
    activeIndex: -1,
    shouldShowSourceCode: true,
  });


  const navMenu: IMenuEntry[] = [
    {
      type: "go",
      label: "Página Inicial",
      icon: "home",
      path: "/dashboard",
      htmlTitle: "Ir para a página inicial",
    },
    {
      type: "go",
      label: "Meus Cartões",
      icon: "stories",
      path: "/dashboard/card",
      routerMath: /\/dashboard\/card(.*)/,
      htmlTitle: "Veja seus cartões",
    },
    {
      type: "go",
      label: "Novo Cartão",
      icon: "add-box",
      path: "/dashboard/setup-card",
      htmlTitle: "Criar um novo cartão",
      routerMath: /\/dashboard\/setup-card(.*)/,
    },
    (
      state.shouldShowSourceCode && !!process.env.NEXT_PUBLIC_APP_REPOSITORY ? {
        label: "Código Fonte",
        icon: "code-folder",
        htmlTitle: "Veja o código fonte do projeto no GitHub",
        type: "fwr",
        href: process.env.NEXT_PUBLIC_APP_REPOSITORY,
      } : null
    ),
  ].filter(Boolean) as IMenuEntry[];


  useEffect(() => {
    dispatch(setIsSidebarOpen(false));

    setState(prev => {
      const activeIndex = navMenu.findIndex(item => {
        if(item.type !== "go")
          return false;
        
        const currentPath = ssrSafeWindow?.location.pathname.split("?")[0] || "";
          
        if(typeof item.path !== "string")
          return (
            item.path.pathname === currentPath ||
              item.routerMath?.test(currentPath) ||
              item.matchRoutes?.includes(currentPath)
          );
        
        return (
          item.path === currentPath ||
            item.routerMath?.test(currentPath) ||
            item.matchRoutes?.includes(currentPath)
        );
      });
  
      return {
        ...prev,
        activeIndex,
      };
    });
  }, [asPath]);


  return (
    <>
      <div className={cn("sidebar", { expanded: isSidebarOpen && isMobile })}>
        <div className="sidebar__logo">
          <Logo />
        </div>
        <div className="sidebar__content">
          <div className="sidebar-menu">
            {
              navMenu.map((item, index) => {
                const c: Record<string, boolean> = {};
                const isActive = state.activeIndex === index;
            
                if(typeof item.shift === "object" && !!item.shift) {
                  for(const prop in (item.shift as Record<string, string>)) {
                    c[`shift-${prop}-${(item.shift as Record<string, string>)[prop]}`] = true;
                  }
                } else if(typeof item.shift === "string") {
                  c[`shift-${item.shift}`] = true;
                }

                return (
                  <Button
                    tabIndex={0}
                    title={item.htmlTitle || item.label}
                    key={`drawer-menu-item-${index}`}
                    className={cn("sidebar-menu__item", c, { active: isActive })}
                    sx={{
                      "--color": item.color ?? "var(--theme-color)",
                      "--contrast": item.contrast ?? "var(--text-color)",
                    }}
                    onClick={(({ target }: { target: HTMLButtonElement }) => {
                      if(target.classList.contains("active") || isActive)
                        return;

                      if(item.type === "do") {
                        item.action?.bind(null)();
                        return;
                      }

                      if(item.type === "fwr" && !!item.href) {
                        window.open(item.href, "_blank", "noopener,noreferrer");
                        return;
                      }

                      if(item.type === "go") {
                        navigate(item.path);
                      }
                    }) as () => void}
                  >
                    <>
                      {
                        isActive && !!item.activeIcon ? (
                          typeof item.activeIcon === "string" ?
                            <Icon icon={item.activeIcon as any} /> :
                            item.activeIcon
                        ) : (
                          typeof item.icon === "string" ?
                            <Icon icon={item.icon as any} /> :
                            item.icon
                        )
                      }
                    </>
                    <Typography.Text>
                      {item.label}
                    </Typography.Text>
                  </Button>
                );
              })
            }
          </div>
          <Dropdown
            tabIndex={0}
            buttonTitle="Veja as opções para o usuário atual"
            direction="top"
            button={(<>
              <div>
                <Icon icon="person" /> {/* TODO: REPLACE IT WITH AN IMAGE!! */}
                <section className="flex-stack">
                  <Typography.Text>
                    {user?.displayName}
                  </Typography.Text>
                  <Typography.Text component="p">
                    {user?.emailAddress}
                  </Typography.Text>
                </section>
              </div>
              <Icon icon="unfold-more" />
            </>)}
            buttonStyles={{
              padding: "0.35rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              cursor: "pointer",
              background: "transparent",
              border: "1px solid transparent",
              outline: "none",
              borderRadius: "4.5px",

              "& > div": {
                display: "flex",
                alignItems: "center",
                gap: "0.58rem",
                width: "calc(100% - 1rem)",

                "& > .icon": {
                  fontSize: "32px",
                  fontWeight: 300,
                  color: "var(--text-color)",
                },

                "& > img": {
                  "--size": "32px",

                  width: "var(--size)",
                  height: "var(--size)",
                  borderRadius: "50%",
                  objectFit: "cover",
                  pointerEvents: "none",
                  userSelect: "none",
                },

                "& > section": {
                  width: "calc(100% - 50px)",

                  "& > span, & > p": {
                    ...clampLine(1, "ellipsis", true),
                  
                    width: "100%",
                    fontSize: "0.825rem",
                    fontWeight: "normal",
                    letterSpacing: "var(--default-letter-spacing)",
                    textAlign: "left",
                    color: "var(--text-color)",
                  },

                  "& > p": {
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  },
                },
              },

              "& > .icon": {
                fontSize: "18px",
                fontWeight: 300,
                color: "var(--text-secondary)",
              },
            
              "@media (hover: hover)": {
                "&:hover": {
                  backgroundColor: "var(--hover-muted-color)",
                },
              },
            }}
          >
            <DropdownItem
              icon={(<Icon icon="settings" style={{ marginTop: "1.5px" }} />)}
              label="Configurações"
              action={() => {
                navigate("/dashboard/settings");
              }}
            />
            <DropdownItem
              icon={(<Icon icon="logout" style={{ marginTop: "1.5px" }} />)}
              label="Sair"
            />
          </Dropdown>
        </div>
      </div>
      <div
        className={cn("sidebar-overlay", "extends__overlay", "blur-offset-1", { active: isSidebarOpen })}
        onClick={() => dispatch(setIsSidebarOpen(false))}
      ></div>
    </>
  );
};

export default memo(Sidebar);
