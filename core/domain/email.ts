import { Exception } from "@/core/errors";
import { Either, left, right } from "../either";


class EmailAddress {
  private readonly _value: string;

  private constructor(_value: string) {
    this._value = EmailAddress.normalize(_value);
  }

  public get value(): string {
    return this._value;
  }

  public static validate(value: unknown): value is string {
    if(typeof value !== "string")
      return false;

    // eslint-disable-next-line no-useless-escape
    return /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i.test(
      EmailAddress.normalize(value) // eslint-disable-line comma-dangle
    );
  }

  public static normalize(value: unknown): string {
    if(typeof value !== "string")
      return "";

    return value.trim().toLowerCase();
  }

  public static create(value?: string): Either<Exception, EmailAddress> {
    if(!EmailAddress.validate(value))
      return left(new Exception("The provided email address is not valid", "ERR_INVALID_TYPE"));

    return right(new EmailAddress(value));
  }
}

export default EmailAddress;
