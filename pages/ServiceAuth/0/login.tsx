import { Box } from "@mui/material";
import { toast } from "react-toastify";
import React, { useRef, useState } from "react";
import { validateEmail } from "typesdk/validators";

import { delayed } from "@/utils";
import { api, transporter } from "@/lib/http";
import { toastify } from "@/core/errors/parser";
import AuthLayout from "@/components/AuthLayout";
import { useQueryState, useRender } from "@/hooks";
import { Button, FormGroup, Link, Loader, Typography } from "@/components";


interface QueryStringState {
  continue: string;
}


const Login = () => {
  const refs = {
    id: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  const { query, ...queryState } = useQueryState<QueryStringState>();

  const [state, setState] = useState({
    isLoading: false,

    idError: null as string | null,
    passwordError: null as string | null,

    hasId: false,
    hasPassword: false,
  });

  const disabled = !(state.hasId && state.hasPassword);

  useRender(() => {
    refs.id.current?.focus();
  });


  async function signInRequest(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    event?.stopPropagation();

    if(state.isLoading)
      return;

    const identifier = refs.id.current?.value.trim();
    const password = refs.password.current?.value.trim();

    if(!identifier) {
      setState(prev => ({
        ...prev,
        idError: "Você precisa informar um nome de usuário ou e-mail",
      }));

      delayed(() => refs.id.current?.focus(), 10);
      return;
    }

    if(identifier.includes("@") && !validateEmail(identifier)) {
      setState(prev => ({
        ...prev,
        idError: "Você precisa informar um e-mail válido",
      }));

      delayed(() => refs.id.current?.focus(), 10);
      return;
    }

    if(!password || password.length < 6) {
      setState(prev => ({
        ...prev,
        passwordError: "Sua senha precisa ter pelo menos 6 caracteres",
      }));

      delayed(() => refs.password.current?.focus(), 10);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const body = await transporter.createToken({
        password,
        identifier,
      });

      const res = await api.post("/api/v1/auth/signin/ep", {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json,application/octet-stream",
        },
        body: JSON.stringify(body),
      });

      if(res.status !== 200) {
        const { msg, kind } = await toastify("signup:http", res);
        toast[kind](msg);

        return;
      }

      window.location.href = `/api/v1/rc?continue=${encodeURIComponent(decodeURIComponent(query.continue ?? "/dashboard"))}`;
    } catch (err: any) {
      console.error("AUTH:SIGN_IN", err);
      toast.error("Algo não deu certo. Tente novamente");
    } finally {
      delayed(() => setState(prev => ({ ...prev, isLoading: false })));
    }
  }


  return (
    <AuthLayout
      sx={{
        "& > span": {
          display: "inline-block",
          fontSize: "1.45rem",
          fontWeight: 500,
          color: "var(--text-color)",
          width: "100%",
          textAlign: "center",

          "& > span:first-of-type": {
            textTransform: "uppercase",
            color: "var(--theme-color)",
            fontStyle: "italic",
            fontWeight: 600,
          },

          "& > span:last-of-type": {
            textTransform: "capitalize",
            color: "var(--text-secondary)",
            letterSpacing: 0,
            fontStyle: "italic",
            fontWeight: 600,
          },

          "&:last-of-type": {
            fontSize: "1.175rem",
            marginTop: "0.425rem",
          },
        },

        "& > form": {
          width: "100%",
          marginTop: "4rem",

          "& > * ~ *": {
            marginTop: "1.15rem",
          },
        },
      }}
    >
      <Typography.Title>
        <span>CODE</span> <span className="font-jet-mono">Letters</span>
      </Typography.Title>
      <Typography.Title>
        Bem-vindo de volta!
      </Typography.Title>
      <form
        noValidate
        onSubmit={signInRequest}
      >
        <FormGroup
          ref={refs.id}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck="false"
          icon="account"
          label="Nome de usuário ou e-mail"
          disabled={state.isLoading}
          helpText={state.idError}
          onChange={({ target }) => {
            setState(prev => ({
              ...prev,
              idError: null,
              hasId: target.value.trim().length > 0,
            }));
          }}
          onKeyUp={({ key }) => {
            if(key === "Enter") {
              refs.password.current?.focus();
            }
          }}
        />
        <FormGroup
          ref={refs.password}
          type="password"
          inputMode="text"
          autoComplete="off"
          spellCheck="false"
          icon="password"
          label="Senha"
          disabled={state.isLoading}
          helpText={state.passwordError}
          onChange={({ target }) => {
            setState(prev => ({
              ...prev,
              passwordError: null,
              hasPassword: target.value.trim().length > 0,
            }));
          }}
          onKeyUp={({ key }) => {
            if(key === "Enter") {
              signInRequest(void 0);
            }
          }}
        />
        <Box
          sx={{
            width: "100%",
            
            "& > a": {
              marginLeft: "auto",
              float: "right",
            },
          }}
        >
          <Link
            href={`/ServiceAuth/0/signup?${queryState.toString()}`}
            target="_self"
          >
            <Typography.Text>Não tem uma conta?</Typography.Text>
          </Link>
        </Box>
        {
          state.isLoading ? (
            <Box
              sx={{
                width: "100%",
                height: "42px",
                borderRadius: "calc(4.5px + 1.21875rem)",
                marginTop: "2.15rem !important",
                backgroundColor: "var(--theme-A100)",

                "& > .loader .icon": {
                  fontSize: "22px",
                  fontWeight: 300,
                  color: "var(--theme-color)",
                },
              }}
            >
              <Loader active={state.isLoading} fill />
            </Box>
          ) : (
            <Button
              type="submit"
              tabIndex={0}
              disabled={disabled}
              sx={{
                borderRadius: "calc(4.5px + 1.21875rem)",
                marginTop: "2.15rem !important",
                width: "100%",
                height: "42px",
                cursor: disabled ? "default" : "pointer",
                backgroundColor: disabled ? "var(--border-color)" : "var(--theme-color)",
                color: disabled ? "var(--text-secondary)" : "#fefeff",
                border: "1px solid transparent",
                outline: "none",
                transition: "background-color .18s ease-in-out, color .13s ease-in-out",

                "& > span": {
                  fontSize: "0.975rem",
                  fontWeight: "normal",
                  letterSpacing: "var(--default-letter-spacing)",
                },

                "&:active:not([disabled])": {
                  borderColor: "var(--theme-color)",
                },

                "&:focus-visible": {
                  outlineOffset: "2px",
                  outline: "2px solid var(--accent-color)",
                },

                "@media (hover: hover)": {
                  "&:hover:not([disabled])": {
                    backgroundColor: "var(--theme-A100)",
                    color: "var(--theme-color)",
                  },
                },
              }}
            >
              <Typography.Text>
                Entrar
              </Typography.Text>
            </Button>
          )
        }
      </form>
    </AuthLayout>
  );
};

export default Login;
