export class Container {
  private services = new Map<string, unknown>();
  private factories = new Map<string, (container: Container) => unknown>();

  public register<T>(identifier: string, instance: T): void {
    this.services.set(identifier, instance);
  }

  public registerFactory<T>(identifier: string, factory: (container: Container) => T): void {
    this.factories.set(identifier, factory);
  }

  public resolve<T>(identifier: string): T {
    if (this.services.has(identifier)) {
      return this.services.get(identifier) as T;
    }

    if (this.factories.has(identifier)) {
      const factory = this.factories.get(identifier)!;
      const instance = factory(this);
      // Optional: cache it for Singleton lifetime
      this.services.set(identifier, instance);
      return instance as T;
    }

    throw new Error(`Dependency not found: ${identifier}`);
  }

  public clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}
