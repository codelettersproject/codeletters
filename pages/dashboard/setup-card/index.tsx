import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

import Card from "@/components/Card";
import { cn, useIsMobile } from "@/utils";
import { flexCenter } from "@/styles/theme";
import cardCategories from "@/resources/static/card-categories";

import {
  Button,
  Container,
  FormGroup,
  Icon,
  ResizableTextarea,
  Select,
  SliderSwitch,
  Typography,
  Wrapper,
} from "@/components";

import { useQueryState } from "@/hooks";
import { EventController } from "@/lib/react";
import cardIcons from "@/resources/static/card-icons";


const initialCardProps = {
  b: true,
  bs: true,
  bgl: true,
  i: "abc" as string | null,
  title: null as string | null,
  cc: "funny",
  c: "Escreva sua mensagem aqui. _Markdown é suportado_",
};


const SetupCard = () => {
  const isMobile = useIsMobile();

  const controllersContainerRef = useRef<HTMLDivElement>(null);
  const textAreaControllerRef = useRef<EventController>(new EventController());
  
  const { query, ...queryState } = useQueryState<typeof initialCardProps>();

  const [state, setState] = useState({
    cardProps: initialCardProps,
  });

  useEffect(() => {
    const updated: any = { ...initialCardProps };

    for(const prop in initialCardProps) {
      if(prop in query && Object.prototype.hasOwnProperty.call(query, prop)) {
        let value: any = query[prop];

        if(["true", "false"].includes(value.toLowerCase())) {
          value = value.toLowerCase() === "true";
        } else if(value.toLowerCase() === "null") {
          value = null;
        }

        updated[prop] = value;
      }
    }

    setState(prev => ({ ...prev, cardProps: updated }));
  }, [query]);


  function updateCardProps<K extends keyof typeof initialCardProps>(field: K, value: (typeof initialCardProps)[K]): void {
    queryState.set(field, String(value));
  }


  return (
    <Wrapper hs m={{ dt: "Novo Cartão | Code Letters" }}>
      <Container
        size="sx"
        spacing="none"
        fullHeight
        sx={{ height: "100% !important" }}
      >
        <Box
          sx={{
            width: "100%",
            height: isMobile ? undefined : "100%",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "7fr 5fr",
            gap: "1rem",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              padding: "1rem 1.1rem",
              overflow: "auto",
              ...flexCenter,
            }}
          >
            <Card {...state.cardProps} />
          </Box>
          <Box
            ref={controllersContainerRef}
            sx={{
              width: "100%",
              height: "100%",
              padding: "1rem 1.1rem",
              borderRadius: "4.5px",
              overflow: "auto",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",

                "& > span": {
                  width: "100%",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  display: "inline-block",
                },
              }}
            >
              <Typography.Title>
                Personalize seu cartão
              </Typography.Title>
              <Button
                tabIndex={0}
                variant="discreet"
                onClick={() => {
                  try {
                    if(JSON.stringify(state.cardProps) === JSON.stringify(initialCardProps)) {
                      window.location.href = "/dashboard";
                      return;
                    }

                    if(confirm("Tem certeza que deseja descartar o cartão atual?")) {
                      window.location.href = "/dashboard";
                    }
                  } catch {
                    window.location.href = "/dashboard";
                  }
                }}
                sx={{
                  color: "var(--theme-red)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  padding: ".5rem 1.3rem",
                  borderRadius: "25px",

                  "& > span": {
                    letterSpacing: "var(--default-letter-spacing)",
                  },

                  "&:focus-visible": {
                    outlineOffset: "2px",
                    outline: "2px solid var(--accent-color)",
                  },

                  "@media (hover: hover)": {
                    "&:hover": {
                      backgroundColor: "var(--theme-red-A100)",
                    },
                  },
                }}
              >
                <Typography.Text>
                  Cancelar
                </Typography.Text>
              </Button>
            </Box>
            <Box
              sx={{
                width: "100%",
                marginTop: "3rem",
                position: "relative",

                "& > span": {
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "calc(var(--default-letter-spacing) / 2)",
                  color: "var(--text-color)",
                  pointerEvents: "none",
                  userSelect: "none",
                  marginBottom: "0.2rem",
                },
              }}
            >
              <Typography.Text>Selecione a categoria</Typography.Text>
              <Select
                height="42px"
                disallowUndefined
                tabIndex={0}
                options={cardCategories}
                defaultSelectedValue={state.cardProps.cc}
                onSelectedValueChange={e => {
                  const v = typeof e === "string" ? e : e?.value;

                  if(!v)
                    return;

                  updateCardProps("cc", v);
                }}
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                marginTop: "2rem",

                "& > .switch-row": {
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",

                  "& ~ .switch-row": {
                    marginTop: "1.25rem",
                  },

                  "& > label": {
                    cursor: "pointer",
                  },
                },
              }}
            >
              <div className="switch-row">
                <SliderSwitch
                  id="outer-shadow-togge"
                  tabIndex={0}
                  checked={state.cardProps.bs}
                  color={state.cardProps.bs ? "var(--theme-green)" : "var(--theme-red)"}
                  buttonSize={40}
                  onStateToggle={e => {
                    updateCardProps("bs", e.checked);
                  }}
                />
                <label htmlFor="outer-shadow-togge">
                  Sombra externa
                </label>
              </div>
              <div className="switch-row">
                <SliderSwitch
                  id="border-visible-togge"
                  tabIndex={0}
                  checked={state.cardProps.b}
                  color={state.cardProps.b ? "var(--theme-green)" : "var(--theme-red)"}
                  buttonSize={40}
                  onStateToggle={e => {
                    updateCardProps("b", e.checked);
                  }}
                />
                <label htmlFor="border-visible-togge">
                  Borda colorida
                </label>
              </div>
              <div className="switch-row">
                <SliderSwitch
                  id="icons-togge"
                  tabIndex={0}
                  checked={state.cardProps.i != null}
                  color={state.cardProps.i ? "var(--theme-green)" : "var(--theme-red)"}
                  buttonSize={40}
                  onStateToggle={e => {
                    updateCardProps("i", e.checked ? "abc" : null);
                  }}
                />
                <label htmlFor="icons-togge">
                  Ícones diagonais
                </label>
              </div>
              {
                state.cardProps.i != null ? (
                  <Box
                    sx={{
                      width: "100%",
                      marginTop: "0.75rem",
                      paddingLeft: "4rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      paddingBottom: "1rem",

                      "& > .icon": {
                        fontSize: "22px",
                        fontWeight: 300,
                        borderRadius: "50%",
                        padding: "0.45rem",
                        cursor: "pointer",

                        "&.active": {
                          backgroundColor: "var(--theme-color)",
                        },

                        "@media (hover: hover)": {
                          "&:hover:not(.active)": {
                            backgroundColor: "var(--hover-muted-color)",
                          },
                        },
                      },
                    }}
                  >
                    {
                      cardIcons.map((item, index) => (
                        <Icon
                          tabIndex={0}
                          role="button"
                          icon={item as any}
                          className={cn({ active: item === state.cardProps.i })}
                          key={`icon-selector-t-${index}`}
                          onClick={() => {
                            updateCardProps("i", item);
                          }}
                        />
                      ))
                    }
                  </Box>
                ) : null
              }
              <div className="switch-row">
                <SliderSwitch
                  id="title-togge"
                  tabIndex={0}
                  checked={state.cardProps.title != null}
                  color={state.cardProps.title ? "var(--theme-green)" : "var(--theme-red)"}
                  buttonSize={40}
                  onStateToggle={e => {
                    updateCardProps("title", e.checked ? "__$__default" : null);
                  }}
                />
                <label htmlFor="title-togge">
                  Título
                </label>
              </div>
              {
                state.cardProps.title != null ? (
                  <Box
                    sx={{
                      width: "100%",
                      marginTop: "0.75rem",
                      paddingLeft: "4rem",
                    }}
                  >
                    <FormGroup
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      spellCheck="false"
                      borderColor="var(--accent-color)"
                      label="Título do cartão"
                      placeholder="Digite um título para o seu cartão..."
                      defaultValue={query.title && query.title !== "__$__default" ? query.title : undefined}
                      onChange={({ target }) => {
                        updateCardProps("title", target.value || "__$__default");
                      }}
                    />
                  </Box>
                ) : null
              }
            </Box>
            <Box
              sx={{
                width: "100%",
                marginTop: "2rem",

                "& textarea": {
                  "&:focus": {
                    outlineOffset: "2px",
                    outline: "2px solid var(--accent-color) !important",
                  },
                },
              }}
            >
              <ResizableTextarea
                resetIcon
                maxHeight="18rem"
                autoComplete="off"
                spellCheck="false"
                defaultValue={query.c}
                _controller={textAreaControllerRef.current}
                placeholder="Escreva sua mensagem aqui. _Markdown é suportado_"
                onChange={({ target }) => {
                  updateCardProps("c", target.value.trim() || "Escreva sua mensagem aqui. _Markdown é suportado_");
                }}
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                marginTop: "2.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",

                "& > button": {
                  padding: ".5rem 1.3rem",
                  borderRadius: "25px",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--contrast)",
                  backgroundColor: "var(--color)",
                  border: "1px solid transparent",
                  outline: "none",
                  transition: "background-color .18s ease-in-out, color .13s ease-in-out",

                  "& > span": {
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    letterSpacing: "var(--default-letter-spacing)",
                  },

                  "&:focus-visible": {
                    outlineOffset: "2px",
                    outline: "2px solid var(--accent-color)",
                  },

                  "&:active:not([disabled])": {
                    borderColor: "var(--color)",
                  },

                  "&[disabled]": {
                    cursor: "default",
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--border-color)",
                  },

                  "@media (hover: hover)": {
                    "&:hover:not([disabled])": {
                      backgroundColor: "var(--foreground)",
                      color: "var(--color)",
                    },
                  },
                },
              }}
            >
              <Button
                tabIndex={0}
                disabled={JSON.stringify(state.cardProps) === JSON.stringify(initialCardProps)}
                sx={{
                  "--color": "var(--theme-red)",
                  "--contrast": "#fefeff",
                  "--foreground": "var(--theme-red-A100)",
                }}
                onClick={() => {
                  if(JSON.stringify(state.cardProps) === JSON.stringify(initialCardProps))
                    return;

                  if(confirm("Tem certeza que deseja descartar o cartão atual?")) {
                    setState(prev => ({ ...prev, cardProps: initialCardProps }));
                    textAreaControllerRef.current.emit("reset");

                    const del: string[] = [];

                    for(const prop in query) {
                      if(prop in initialCardProps) {
                        del.push(prop);
                      }
                    }

                    queryState.remove(del);
                    controllersContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              >
                <Typography.Text>
                  Recomeçar
                </Typography.Text>
              </Button>
              <Button
                tabIndex={0}
                disabled={JSON.stringify(state.cardProps) === JSON.stringify(initialCardProps)}
                onClick={() => {
                  if(JSON.stringify(state.cardProps) !== JSON.stringify(initialCardProps)) {
                    window.location.href = `/dashboard/setup-card/review?${queryState.toString()}`;
                  }
                }}
                sx={{
                  "--color": "var(--theme-green)",
                  "--contrast": "#fefeff",
                  "--foreground": "var(--theme-green-A100)",
                }}
              >
                <Typography.Text>
                  Continuar
                </Typography.Text>
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Wrapper>
  );
};

export default SetupCard;
