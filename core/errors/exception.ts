import HttpError from "./http";


class Exception extends HttpError {
  public constructor(
    ucm: string,
    m?: string | null,
    c: string | number | null = -1000,
    ctx?: any // eslint-disable-line comma-dangle
  ) {
    super(ucm, m, c, ctx);
    this.hideUnsafeContext();
  }
}

export default Exception;
