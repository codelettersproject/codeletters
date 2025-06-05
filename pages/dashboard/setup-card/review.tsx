import React, { useEffect, useState } from "react";

import { Box } from "@mui/material";
import Card from "@/components/Card";
import { useIsMobile } from "@/utils";
import { useQueryState } from "@/hooks";
import { flexCenter } from "@/styles/theme";
import { Button, FormGroup, Icon, Typography, Wrapper } from "@/components";


const initialCardProps = {
  b: true,
  hb: false,
  bs: true,
  bgl: true,
  i: "abc" as string | null,
  title: null as string | null,
  cc: "funny",
  c: "Escreva sua mensagem aqui. _Markdown é suportado_",
};


const ReviewCard = () => {
  const isMobile = useIsMobile();

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

  return (
    <Wrapper hs m={{ dt: "Novo Cartão | Code Letters" }}>
      <Box
        sx={{
          width: "100%",
          height: isMobile ? undefined : "100%",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "5fr 8fr",
          gap: "1rem",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            padding: "1rem 1.1rem",
            borderRadius: "4.5px",
            overflow: "auto",

            "& > span": {
              width: "100%",
              fontSize: "1.25rem",
              fontWeight: 500,
              display: "inline-block",
            },
          }}
        >
          <Typography.Title>
            Revise seu cartão antes de salvar
          </Typography.Title>
          <Typography.Text
            component="p"
            sx={{
              width: "100%",
              marginTop: "2rem",
              color: "var(--text-secondary)",
              fontSize: "1rem",
              fontWeight: "normal",
            }}
          >
            Confira cada detalhe do seu cartão, pois você não poderá editá-lo mais tarde. Se algo não parece bom você pode voltar e continuar editando agora.
          </Typography.Text>
          <Box
            sx={{
              width: "100%",
              marginTop: "2.1875rem",

              "& > span": {
                color: "var(--text-secondary)",
                fontSize: "0.95rem",
                fontWeight: "normal",
              },

              "& > div": {
                marginTop: "1.25rem",
              },
            }}
          >
            <Typography.Text>
              Se você quiser, pode dar um nome a este cartão, assim ficará mais fácil encontrá-lo depois. Só você poderá ver esse nome.
            </Typography.Text>
            <FormGroup
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck="false"
              label="Nome do cartão"
              borderColor="var(--accent-color)"
              placeholder="Digite um nome para o cartão aqui..."
            />
          </Box>
          <Box
            className="flex-stack spacing-1"
            sx={{
              width: "100%",
              marginTop: "3.5rem",

              "& > button": {
                ...flexCenter,

                width: "100%",
                padding: ".5rem 1.3rem",
                borderRadius: "6.75px",
                backgroundColor: "var(--color)",
                color: "var(--contrast)",
                border: "1px solid transparent",
                outline: "none",
                gap: "1rem",
                cursor: "pointer",
                transition: "background-color .09s ease-in-out, .065s ease-in-out",

                "& > .icon": {
                  fontSize: "24px",
                  fontWeight: 300,
                  marginTop: "2px",
                },

                "& > span": {
                  fontSize: "0.975rem",
                  fontWeight: "normal",
                  letterSpacing: "var(--default-letter-spacing)",
                },

                "&:focus-visible": {
                  outlineOffset: "2px",
                  outline: "2px solid var(--accent-color)",
                },

                "&:active": {
                  borderColor: "var(--color)",
                },

                "@media (hover: hover)": {
                  "&:hover": {
                    backgroundColor: "var(--foreground)",
                    color: "var(--color)",
                  },
                },
              },
            }}
          >
            <Button
              tabIndex={0}
              onClick={() => {
                window.location.href = `/dashboard/setup-card?${queryState.toString()}`;
              }}
              sx={{
                "--color": "var(--text-color)",
                "--contrast": "var(--box-bg)",
                "--foreground": "var(--border-color)",
              }}
            >
              <Icon icon="arrow-back" />
              <Typography.Text>
                Continuar editando
              </Typography.Text>
            </Button>
            <Button
              tabIndex={0}
              sx={{
                "--color": "var(--theme-green)",
                "--contrast": "#fefeff",
                "--foreground": "var(--theme-green-A100)",
              }}
            >
              <Icon icon="save" />
              <Typography.Text>
                Está bom assim
              </Typography.Text>
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            padding: "3rem 1.5rem",
            overflow: "auto",
            ...flexCenter,
          }}
        >
          <Card {...state.cardProps} />
        </Box>
      </Box>
    </Wrapper>
  );
};

export default ReviewCard;
