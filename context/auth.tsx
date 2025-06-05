import React, { createContext, useContext, useRef, useState } from "react";

import { useRender } from "@/hooks";
import { api, transporter } from "@/lib/http";
import type { SafeUserDocument } from "@/models/users";


export interface AuthContext {
  readonly isLoading: boolean;
  readonly user: SafeUserDocument | null;

  isAuthenticated(): Promise<boolean>;
}

const AuthContextRoot = createContext({} as AuthContext);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const renderedRef = useRef<boolean>(false);

  const [state, setState] = useState({
    isLoading: false,
    user: null as SafeUserDocument | null,
  });

  useRender(async () => {
    if(state.isLoading)
      return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const res = await api.get("/api/v1/users/cs");

      if(res.status !== 20) {
        throw { res };
      }

      const user = await transporter.decryptBuffer<SafeUserDocument>(
        new Uint8Array(await res.arrayBuffer()) // eslint-disable-line comma-dangle
      );

      setState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));
    } catch (err: any) {
      console.error("AUTH:_PROVIDER:RENDER", err);
    } finally {
      renderedRef.current = true;
    }
  }, [setState]);

  async function isAuthenticated(): Promise<boolean> {
    if(state.isLoading && renderedRef.current)
      return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const res = await api.get("/api/v1/users/cs");

      if(![200, 304].includes(res.status)) {
        throw { res };
      }

      const user = await transporter.decryptBuffer<SafeUserDocument>(
        new Uint8Array(await res.arrayBuffer()) // eslint-disable-line comma-dangle
      );

      setState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      console.error("AUTH:_PROVIDER:RENDER", err);
      return false;
    }
  }


  const value = {
    isLoading: state.isLoading,
    user: state.user,
    isAuthenticated,
  };

  return (
    <AuthContextRoot.Provider value={value}>
      {children}
    </AuthContextRoot.Provider>
  );
}


export function useAuth(): AuthContext {
  const ctx = useContext(AuthContextRoot);

  if(!ctx) {
    throw new Error("useAuth must be used within a AuthProvider wrapper");
  }

  return Object.isFrozen(ctx) ? ctx : Object.freeze(ctx);
}
