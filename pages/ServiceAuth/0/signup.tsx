import { Box } from "@mui/material";
import React, { useRef, useState } from "react";
import { validateEmail } from "typesdk/validators";

import { delayed } from "@/utils";
import { api, transporter } from "@/lib/http";
import AuthLayout from "@/components/AuthLayout";
import { Button, FormGroup, Loader, Typography } from "@/components";


const SignUp = () => {
  const refs = {
    username: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  const [state, setState] = useState({
    isLoading: false,

    usernameError: null as string | null,
    emailError: null as string | null,
    passwordError: null as string | null,

    hasUsername: false,
    hasEmail: false,
    hasPassword: false,
  });

  const disabled = !(state.hasUsername && state.hasEmail && state.hasPassword);


  async function signUpRequest(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    event?.stopPropagation();

    if(state.isLoading)
      return;

    const displayName = refs.username.current?.value.trim();
    const emailAddress = refs.email.current?.value.trim();
    const password = refs.password.current?.value.trim();

    if(!displayName) {
      setState(prev => ({
        ...prev,
        usernameError: "Você precisa informar um nome de usuário",
      }));

      return refs.username.current?.focus();
    }

    if(!emailAddress) {
      setState(prev => ({
        ...prev,
        emailError: "Você precisa informar um e-mail",
      }));

      delayed(() => refs.email.current?.focus(), 10);
      return;
    }

    if(!validateEmail(emailAddress)) {
      setState(prev => ({
        ...prev,
        emailError: "Você precisa informar um e-mail válido",
      }));

      delayed(() => refs.email.current?.focus(), 10);
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
        displayName,
        emailAddress,
      });

      const res = await api.post("/api/v1/auth/signup/ep", {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json,application/octet-stream",
        },
        body: JSON.stringify(body),
      });

      console.log({res});
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
        Crie sua conta na <span>CODE</span> <span className="font-jet-mono">Letters</span>
      </Typography.Title>
      <form
        noValidate
        onSubmit={signUpRequest}
      >
        <FormGroup
          ref={refs.username}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck="false"
          icon="account"
          label="Nome de usuário"
          disabled={state.isLoading}
          helpText={state.usernameError}
          onChange={({ target }) => {
            setState(prev => ({
              ...prev,
              usernameError: null,
              hasUsername: target.value.trim().length > 0,
            }));
          }}
          onKeyUp={({ key }) => {
            if(key === "Enter") {
              refs.email.current?.focus();
            }
          }}
        />
        <FormGroup
          ref={refs.email}
          type="text"
          inputMode="email"
          autoComplete="off"
          spellCheck="false"
          icon="mail"
          label="E-mail"
          disabled={state.isLoading}
          helpText={state.emailError}
          onChange={({ target }) => {
            setState(prev => ({
              ...prev,
              emailError: null,
              hasEmail: target.value.trim().length > 4,
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
              signUpRequest(void 0);
            }
          }}
        />
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
                  marginTop: "1.25px",
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
                Criar conta
              </Typography.Text>
            </Button>
          )
        }
      </form>
    </AuthLayout>
  );
};

export default SignUp;
