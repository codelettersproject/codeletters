import { t } from "ndforge";
import { timestamp } from "ndforge/timer";

import User from "@/models/users";
import Service from "@/core/service";
import { redact } from "@/lib/crypto";
import { isProduction } from "@/utils";
import { Cookie } from "@/lib/cookies";
import Session from "@/models/sessions";
import { transporter } from "@/lib/http";
import { HttpError } from "@/core/errors";
import { jsonSafeStringify } from "@/lib/safe-json";
import type { ApiRequest, ApiResponse } from "@/_types";
import AuthResultDTO from "@/modules/auth/dtos/AuthResultDTO";
import SignInRequestDTO from "@/modules/auth/dtos/SignInRequestDTO";


const requestSchema = t.object({
  identifier: t.string(),
  password: t.string().minLength(6),
});


class AuthenticateUserWithEmailAndPasswordService implements Service<SignInRequestDTO, AuthResultDTO> {
  public async execute(request: SignInRequestDTO): Promise<AuthResultDTO> {
    const usr = await User.find(request.identifier);

    if(!usr || usr.deletedAt != null) {
      throw new HttpError("The provided credentials are wrong", null, null, {
        statusCode: 401,
      });
    }

    if(usr.nukedAt != null) {
      throw new HttpError("Your account was banned", null, null, {
        statusCode: 403,
      });
    }

    const now = timestamp();

    const failedAttempts = usr.metadata.failed_login_attempts ?? 0;
    const lastFailedAt = usr.metadata.last_failed_login_attempt;

    if(failedAttempts >= 3 && lastFailedAt) {
      const minutesSinceLastFail =  Math.floor((now - lastFailedAt) / (1000 * 60));

      if(minutesSinceLastFail < 120) {
        throw new HttpError(`Too many failed login attempts. Try again in ${120 - minutesSinceLastFail} minutes.`, null, null, {
          statusCode: 403,
        });
      }
    }

    await usr
      .setMetadata("last_login_attempt", now)
      .save();

    const isPasswordValid = await usr.password.compare(request.password);

    if(!isPasswordValid) {
      await usr
        .setMetadata("failed_login_attempts", failedAttempts + 1)
        .setMetadata("last_failed_login_attempt", now)
        .save();

      throw new HttpError("The provided credentials are wrong", null, null, {
        statusCode: 401,
      });
    }

    const inet = jsonSafeStringify(request._$inet ?? {});

    const session = await Session.create({
      kind: "authx",
      expires: "15m",
      userId: usr.userId,
      payload: { role: "standard", meta: usr.metadata },
      headers: { aud: "usr", _$inet: inet.isRight() ? inet.value : null },
    });

    return {
      target: usr.toSafeDocument(),
      session: session.toRedactedDocument(),
    };
  }

  public static async handle(request: ApiRequest, response: ApiResponse): Promise<void> {
    if(!requestSchema.validate(request.db)) {
      throw new HttpError("One or more required fields are missing on request", null, null, {
        statusCode: 400,
      });
    }

    const { identifier, password } = requestSchema.parse(request.db);

    const { target, session } = await (new AuthenticateUserWithEmailAndPasswordService()).execute({
      identifier,
      password,
    });

    const cookie = new Cookie(redact(session.sessionId, "base64url"), {
      httpOnly: true,
      path: "/",
      sameSite: "Strict",
      secure: isProduction(),
    }).setKey("_CSID");
    
    const body = await transporter.encryptBuffer({ target });
    
    response.setHeader("Set-Cookie", [cookie.toString(true)]);
    
    response.status(200).send(body);
    response.end();
  }
}

export default AuthenticateUserWithEmailAndPasswordService;
