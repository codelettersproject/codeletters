import { NextApiRequest, NextApiResponse } from "next";


export interface RequestContext {
  [key: string]: unknown;
}

export interface RequestInet {
  readonly ipa: string;
  readonly ipc?: string;
  readonly ipcr?: string;
  readonly ipct?: string;
  readonly ipla?: string;
  readonly iplo?: string;
  readonly ipt?: string;
  readonly ipp?: string;
  readonly iph?: {
    readonly vip?: string;
    readonly tlip?: string;
  };
}

export interface ApiRequest extends NextApiRequest {
  readonly rid: string;
  readonly inet: RequestInet;
  readonly ctx: RequestContext;
  readonly db?: Record<string, unknown>;
}

export interface ApiResponse extends NextApiResponse { }


export type RequestHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>;

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
