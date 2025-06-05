import { Box } from "@mui/material";
import React, { useState } from "react";
import { parseRelativeTimeString } from "typesdk/datetime";

import { timeBasedGreeting } from "@/utils";
import { Container, Envelope, Icon, Typography, Wrapper } from "@/components";



const Dashboard = () => {
  const [state, setState] = useState({
    hideWelcomeMessage: false,
    totalCards: 15,
    sharedCards: 7,
    reactions: 0,
    views: 184,
  });

  function hideWelcomeMessage() {
    setState(prev => ({
      ...prev,
      hideWelcomeMessage: true,
    }));
  }

  return (
    <Wrapper m={{ dt: "Página Inicial | Code Letters" }}>
      <Container size="sx">
        {
          state.hideWelcomeMessage ? null : (
            <Box
              sx={{
                width: "100%",
                padding: "1rem 1.8rem",
                backgroundColor: "var(--theme-A100)",
                borderRadius: "9px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2.5rem",

                "& > section": {
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "calc(100% - 34px)",

                  "& > .icon": {
                    fontSize: "24px",
                    fontWeight: 300,
                  },

                  "& > span": {
                    display: "inline-block",
                    fontSize: "0.95rem",
                    width: "calc(100% - 24px)",
                  },
                },

                "& > .icon": {
                  marginTop: "2px",
                  padding: "0.3rem",
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontWeight: 300,
                  
                  "@media (hover: hover)": {
                    "&:hover": {
                      color: "var(--theme-red)",
                    },
                  },
                },
              }}
            >
              <section>
                <Icon icon="info" />
                <Typography.Text>
                  {timeBasedGreeting("pt-br")}, {"Jane Doe"}! Pronto para criar novas mensagens?
                </Typography.Text>
              </section>
              <Icon
                tabIndex={0}
                role="button"
                icon="close"
                onClick={hideWelcomeMessage}
              />
            </Box>
          )
        }
        <Box
          className="row"
          sx={{
            "& .content-box": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",

              "& > .icon": {
                fontSize: "42px",
                fontWeight: 300,
              },

              "& > section": {
                width: "calc(100% - 42px)",

                "& > span": {
                  display: "inline-block",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  letterSpacing: "var(--default-letter-spacing)",
                },

                "& > p": {
                  fontSize: "2rem",
                  fontWeight: 700,
                  letterSpacing: 0,
                  color: "var(--text-color)",
                  marginTop: "0.5rem",
                },
              },

              "@media (hover: hover)": {
                "&:hover": {
                  "& > .icon": {
                    color: "var(--color, var(--theme-color))",
                  },
                },
              },
            },
          }}
        >
          <div className="col-3 col-md-6 col-sm-12">
            <div className="content-box hover-effect">
              <section>
                <Typography.Title>
                  Cartões criados
                </Typography.Title>
                <Typography.Text component="p">
                  {state.totalCards}
                </Typography.Text>
              </section>
              <Icon icon="playlist-check" />
            </div>
          </div>
          <div className="col-3 col-md-6 col-sm-12">
            <div className="content-box hover-effect">
              <section>
                <Typography.Title>
                  Compartilhados
                </Typography.Title>
                <Typography.Text component="p">
                  {state.sharedCards}
                </Typography.Text>
              </section>
              <Icon icon="share" />
            </div>
          </div>
          <div className="col-3 col-md-6 col-sm-12">
            <div className="content-box hover-effect">
              <section>
                <Typography.Title>
                  Visualizações
                </Typography.Title>
                <Typography.Text component="p">
                  {state.views}
                </Typography.Text>
              </section>
              <Icon icon="eye" />
            </div>
          </div>
          <div className="col-3 col-md-6 col-sm-12">
            <div className="content-box hover-effect">
              <section>
                <Typography.Title>
                  Reações
                </Typography.Title>
                <Typography.Text component="p">
                  {state.reactions}
                </Typography.Text>
              </section>
              <Icon icon="mood" />
            </div>
          </div>
        </Box>
        <Box
          sx={{
            width: "100%",
            marginTop: "3rem",

            "& > span": {
              fontSize: "1.7rem",
              fontWeight: 600,
              display: "inline-block",
              letterSpacing: "calc(var(--default-letter-spacing) / 1.75)",
            },

            "& > p": {
              fontSize: "1rem",
              fontWeight: "normal",
              color: "var(--text-secondary)",
              marginTop: "0.625rem",
            },
          }}
        >
          <Typography.Title>
            Cartões criados recentemente
          </Typography.Title>
          <Typography.Text component="p">
            Esses são os últimos três cartões que você criou. Clique neles para ver mais detalhes.
          </Typography.Text>
          <Box
            sx={{
              width: "100%",
              marginTop: "1.75rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              justifyItems: "center",
              gap: "2rem",
            }}
          >
            <Envelope
              oe="hover"
              ocec={() => console.log("CARD CLICKED")}
            >
              <Box
                sx={{
                  width: "100%",

                  "& > h4": {
                    width: "100%",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    letterSpacing: "calc(var(--default-letter-spacing) / 1.5)",
                    color: "var(--text-secondary)",
                  },

                  "& > span": {
                    display: "inline-block",
                    width: "100%",
                    fontSize: "1rem",
                    fontWeight: 500,
                    letterSpacing: "calc(var(--default-letter-spacing) / 1.5)",
                    color: "var(--text-secondary)",
                    marginTop: ".75rem",
                  },

                  "& > p": {
                    width: "100%",
                    fontSize: "0.925rem",
                    fontWeight: "normal",
                    color: "var(--text-secondary)",
                    marginTop: "1.15rem",
                  },
                }}
              >
                <Typography.Title component="h4">
                  [cartão sem nome]
                </Typography.Title>
                <Typography.Title>
                  [cartão sem título]
                </Typography.Title>
                <Typography.Text component="p">
                  card content preview without markdown parsing...
                </Typography.Text>
              </Box>
              <Typography.Text
                sx={{
                  position: "absolute",
                  left: "50%",
                  bottom: "0.505rem",
                  transform: "translateX(-50%)",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  letterSpacing: 0,
                }}
              >
                {parseRelativeTimeString(new Date(Date.now() - 1000 * 60 * 35), "pt-br")}
              </Typography.Text>
            </Envelope>
          </Box>
        </Box>
      </Container>
    </Wrapper>
  );
};

export default Dashboard;
