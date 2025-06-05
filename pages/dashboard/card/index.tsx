import React from "react";
import { Box } from "@mui/material";
import { parseRelativeTimeString } from "typesdk/datetime";

import { useQueryState } from "@/hooks";
import { Container, Envelope, SearchBox, Select, Typography, Wrapper } from "@/components";


interface QueryStringState {
  sort_by: string;
  q: string;
}


const Cards = () => {
  const { query, ...queryState } = useQueryState<QueryStringState>();

  return (
    <Wrapper m={{ dt: "Meus Cartões | Code Letters" }}>
      <Container size="lg">
        <Box
          sx={{
            width: "100%",
            marginTop: "3rem",

            "& > span": {
              fontSize: "1.7rem",
              fontWeight: 600,
              display: "inline-block",
              letterSpacing: "calc(var(--default-letter-spacing) / 1.75)",
              textTransform: "uppercase",
            },

            "& > p": {
              fontSize: "1rem",
              fontWeight: "normal",
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
            },
          }}
        >
          <Typography.Title>
            seus cartões
          </Typography.Title>
          <Typography.Text component="p">
            Aqui estão todos os carões que você criou. Clique neles para ver mais detalhes.
          </Typography.Text>
        </Box>
        <Box
          className="row"
          sx={{
            width: "100%",
            marginTop: "3.5rem",

            "& input::-webkit-input-placeholder": {
              color: "var(--text-secondary)",
            },
          }}
        >
          <div className="col-7 col-md-6 col-sm-12">
            <SearchBox
              height="45px"
              placeholder="Pesquise em seus cartões..."
              defaultValue={query.q}
              onChange={({ target }) => {
                if(!target.value) {
                  queryState.remove("q");
                } else {
                  queryState.set("q", target.value);
                }
              }}
            />
          </div>
          <div className="col-5 col-md-6 col-sm-12">
            <Select
              options={[
                {
                  label: "Mais recentes",
                  value: "latest",
                },
                {
                  label: "Mais antigos",
                  value: "oldest",
                },
                {
                  label: "Maiores visualizações/reações",
                  value: "top_rated",
                },
              ]}
              disallowUndefined
              height="45px"
              placeholder="Ordernar por"
              defaultSelectedValue={query.sort_by ?? "latest"}
              onSelectedValueChange={e => {
                const v = typeof e === "string" ? e : e?.value;
                queryState.set("sort_by", v || "latest");
              }}
            />
          </div>
        </Box>
        <Box
          sx={{
            width: "100%",
            marginTop: "4rem",
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
      </Container>
    </Wrapper>
  );
};

export default Cards;
