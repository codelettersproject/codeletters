class HttpError extends Error {
  private _hideContext: boolean = true;

  public constructor(
    public readonly unsafeContextMessage: string,
    message?: string | null,
    public readonly code: string | number | null = -1000,
    public readonly context?: any // eslint-disable-line comma-dangle
  ) {
    super(message ?? "");

    if(typeof code === "undefined" || code == null) {
      this.code = -1000;
    }
  }

  public showUnsafeContext(): this {
    this._hideContext = false;
    return this;
  }

  public hideUnsafeContext(): this {
    this._hideContext = true;
    return this;
  }

  public shouldHideUnsafeContext(): boolean {
    return this._hideContext;
  }

  public toJSON(): object {
    return {
      code: this.code,
      message: this.unsafeContextMessage,
      context: this._hideContext ? this.context?.safeContext : this.context,
    };
  }
}

export default HttpError;
