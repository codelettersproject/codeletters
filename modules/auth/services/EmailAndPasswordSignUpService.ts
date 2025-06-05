import { t } from "ndforge";

import User from "@/models/users";
import { transporter } from "@/lib/http";
import { HttpError } from "@/core/errors";
import type { ApiRequest, ApiResponse } from "@/_types";
import SignUpResultDTO from "@/modules/auth/dtos/SignUpResultDTO";
import SignUpRequestDTO from "@/modules/auth/dtos/SignUpRequestDTO";
import SignUpController from "@/modules/auth/iface/SignUpController";


const requestSchema = t.object({
  displayName: t.string(),
  emailAddress: t.string().email(),
  password: t.string().minLength(6),
});


class EmailAndPasswordSignUpService extends SignUpController {
  private constructor( private readonly _rq: SignUpRequestDTO ) { super(); }

  protected _getCredentials(): SignUpRequestDTO {
    return this._rq;
  }

  public async execute(): Promise<SignUpResultDTO> {
    const { emailAddress, password, displayName, kind } = this._getCredentials();

    if(kind !== "e/p" || !password) {
      throw new HttpError("Current authentication method does not support direct email and password sign up", null, null, {
        statusCode: 406,
      });
    }

    const existsWithEmail = await User.find(emailAddress);

    if(existsWithEmail != null) {
      throw new HttpError("An user with this email already exists", null, null, {
        statusCode: 409,
      });
    }

    const existsWithUsername = await User.find(displayName);

    if(existsWithUsername != null) {
      throw new HttpError("An user with this username already exists", null, null, {
        statusCode: 409,
      });
    }

    const usr = await User.create({
      displayName,
      emailAddress,
      password: password.normalize(),
    });

    return {
      target: usr.toSafeDocument(),
    };
  }

  public static async handle(request: ApiRequest, response: ApiResponse): Promise<void> {
    if(!requestSchema.validate(request.db)) {
      throw new HttpError("One or more required fields are missing on request", null, null, {
        statusCode: 400,
      });
    }

    const { displayName, emailAddress, password } = requestSchema.parse(request.db);

    const { target } = await (new EmailAndPasswordSignUpService({
      displayName,
      emailAddress,
      password,
      kind: "e/p",
    })).execute();

    const body = await transporter.encryptBuffer({ target });

    response.status(201).send(body);
    response.end();
  }
}

export default EmailAndPasswordSignUpService;
