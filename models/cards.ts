import { chunkToBuffer } from "ndforge";

import sql from "@/lib/sql";
import { connect } from "@/lib/database";
import Entity from "@/core/domain/entity";
import { Exception } from "@/core/errors";
import { redact, sign, unwrapRedacted } from "@/lib/crypto";
import { jsonSafeParser, jsonSafeStringify } from "@/lib/safe-json";


export const enum CARD_STATUS {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  BANNED = "BANNED",
}

export const enum CARD_REACTION {
  LIKE = "LIKE",
  LOVE = "LOVE",
  DISLIKE = "DISLIKE",
  REPORT = "REPORT",
}


export type Properties = {
  b?: boolean;
  c?: string;
  cn?: string;
  hb?: boolean;
  bgl?: boolean;
  bs?: boolean;
  cc?: string;
  i?: string | null;
  title?: string | null;
};


export type CardReaction = {
  readonly reactorId: string;
  readonly reactionKind: CARD_REACTION;
  readonly createdAt: string;
};

export type CardDocument = {
  readonly cardId: string;
  readonly shortCode: string;
  readonly name?: string;
  readonly ownerId: string;
  readonly status: CARD_STATUS;
  readonly cardProps: Properties;
  readonly createdAt: string;
  readonly updatedat: string;
};

export type CardWithReactions = CardDocument & {
  readonly reactions: CardReaction[];
};


type CardProps = {
  shortCode?: string;
  name?: string;
  ownerId: string;
  status?: CARD_STATUS;
  cardProps: Properties;
  createdAt?: string;
  updatedAt?: string;
  reactions?: CardReaction[];
  __d_c?: any[];
};


class Card extends Entity<CardProps> {
  private constructor(props: CardProps, id?: string) {
    super(props, id);
  }
  
  public get cardId(): string {
    return this._id;
  }

  public get shortCode(): string {
    return this._props.shortCode!;
  }

  public get name(): string | null {
    return this._props.name || null;
  }

  public set name(value: string | null | undefined) {
    this._props.name = value?.trim() || void 0;
  }

  public get ownerId(): string {
    return this._props.ownerId;
  }

  public get status(): CARD_STATUS {
    return this._props.status!;
  }

  public set status(s: CARD_STATUS) {
    this._props.status = s;
  }

  public get cardProps(): Properties {
    return this._props.cardProps;
  }

  public set cardProps(value: Properties) {
    this._props.cardProps = value;
  }

  public get reactions(): readonly CardReaction[] {
    return Object.freeze([ ...(this._props.reactions ?? []) ]);
  }

  public get createdAt(): Date {
    return new Date(this._props.createdAt!);
  }

  public get updatedAt(): Date {
    return new Date(this._props.updatedAt!);
  }

  public static async create(props: CardProps): Promise<Card> {
    const cardProps = jsonSafeStringify(props.cardProps);
    const database = await connect();

    try {
      const tsNow = new Date().toUTCString();

      const { result, __d_c } = await database.transaction(async client => {
        const { rows } = await sql("cards")
          .insert({
            card_id: Card.generateId("long"),
            short_code: Card.generateId("short"),
            owner_id: props.ownerId,
            card_name: props.name || null,
            created_at: tsNow,
            updated_at: tsNow,
          })
          .execute(client);

        const bc: Buffer[] = [];
        const buffer = chunkToBuffer(cardProps.isRight() ? cardProps.value : "{}");

        for(let i = 0; i < buffer.byteLength; i += 4096) {
          bc.push(buffer.subarray(i, i + 4096));
        }

        if(bc.length === 0) {
          bc.push(buffer);
        }

        const __d_c: any[] = [];

        for(let j = 0; j < bc.length; j++) {
          const r = await sql("card_chunks")
            .insert({
              card_id: rows[0].card_id,
              c_idx: j,
              c_hash: sign(bc[j], "base64"),
              c_data: redact(bc[j], "base64"),
            })
            .execute(client);

          __d_c.push(r.rows[0]);
        }

        return { result: { rows }, __d_c };
      });

      return Card.__new({
        rows: [
          {
            ...result.rows[0],
            __d_c,
          },
        ],
      });
    } finally {
      await database.close();
    }
  }

  private static __new(result: { rows: any[] }): Card {
    const c: Buffer[] = [];

    if(Array.isArray(result.rows[0].__d_c)) {
      for(let i = 0; i < result.rows[0].__d_c.length; i++) {
        const { c_hash, c_data } = (result.rows[0].__d_c as any[])
          .find(item => item.c_idx === i);

        const dc = unwrapRedacted(c_data, null, "base64");

        if(!sign(dc).equals(Buffer.from(c_hash, "base64"))) {
          throw new Exception(`Could not validate the signature of card chunk $${i}`);
        }

        c.push(dc);
      }
    }

    const cardProps = jsonSafeParser<Properties>(Buffer.concat(c).toString("utf-8"));

    if(cardProps.isLeft()) {
      throw cardProps.value;
    }

    return new Card({
      cardProps: cardProps.value,
      ownerId: result.rows[0].owner_id,
      name: result.rows[0].card_name,
      reactions: result.rows[0].reactions,
      status: result.rows[0].status,
      shortCode: result.rows[0].short_code,
      createdAt: Card._stringifyDate(result.rows[0].created_at),
      updatedAt: Card._stringifyDate(result.rows[0].updated_at),
    }, result.rows[0].card_id);
  }
}

export default Card;
