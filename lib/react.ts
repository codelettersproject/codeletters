export class EventController {
  private readonly _l: Map<string, Set<(...args: any[]) => unknown>> = new Map();

  public on(event: string, callback: (...args: any[]) => unknown): void {
    if(!this._l.has(event)) {
      this._l.set(event, new Set());
    }

    const set = this._l.get(event)!;
    set.add(callback);
  }

  public emit(event: string, ...args: any[]): void {
    const set = this._l.get(event);

    if(!set)
      return;

    for(const l of set) {
      l(...args);
    }
  }
}
