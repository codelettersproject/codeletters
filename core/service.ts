interface Service<T, R> {
  execute(r: T): R | Promise<R>;
}

export default Service;
