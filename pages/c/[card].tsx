import React from "react";
import { Box } from "@mui/material";
import type { GetServerSidePropsContext } from "next";


export type CardViewerProps = {
  readonly card: string;
}

const CardViewer = (p: CardViewerProps) => {
  return (
    <Box>
      card viewer {p.card}
    </Box>
  );
};


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const card = (context.query.card || context.params?.card) as string | undefined;

  if(!card) return { notFound: true };

  return {
    props: { card },
  };
}


export default CardViewer;
