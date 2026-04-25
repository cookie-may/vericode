/*
 * lib/core/di/ServiceContainer.ts
 *
 * A simple dependency injection container. It allows registration of services
 * and their dependencies, and resolves them when requested. This supports SOLID
 * principles by decoupling components from their dependencies.
 */

type Factory<T> = () => T;

enum Scope {
    Singleton = 'singleton',
    Transient = 'transient',
}

interface RegistrationOptions {
    scope?: Scope;
    dependencies?: string[]; // Names of services to inject
}

export class ServiceContainer {
    private registrations: Map<string, { factory: Factory<unknown>; scope: Scope; dependencies: string[]; instance?: unknown }> = new Map();

    /**
     * Registers a service with the container.
     * @param name The unique name/identifier for the service.
     * @param factory A function that creates an instance of the service.
     * @param options Registration options like scope and dependencies.
     */
    register<T>(name: string, factory: Factory<T>, options: RegistrationOptions = {}): void {
        if (this.registrations.has(name)) {
            console.warn(`Service "${name}" is already registered. Overwriting.`);
        }
        this.registrations.set(name, {
            factory,
            scope: options.scope || Scope.Singleton,
            dependencies: options.dependencies || [],
            instance: undefined, // Initialize instance as undefined
        });
        console.log(`Registered service "${name}" with scope ${options.scope || Scope.Singleton}`);
    }

    /**
     * Resolves a service by its name.
     * @param name The name of the service to resolve.
     * @returns The instance of the resolved service.
     */
    resolve<T>(name: string): T {
        const registration = this.registrations.get(name);
        if (!registration) {
            throw new Error(`Service "${name}" not found.`);
        }

        // Handle Singleton scope
        if (registration.scope === Scope.Singleton) {
            if (registration.instance === undefined) {
                // Create instance if it doesn't exist
                registration.instance = this.createInstance<T>(registration.factory, registration.dependencies);
            }
            return registration.instance;
        }

        // Handle Transient scope
        if (registration.scope === Scope.Transient) {
            return this.createInstance<T>(registration.factory, registration.dependencies);
        }

        // Fallback for unknown scopes or errors
        throw new Error(`Unknown scope or error resolving service "${name}".`);
    }

    private createInstance<T>(factory: Factory<T>, dependencies: string[]): T {
        const resolvedDependencies = dependencies.map(depName => this.resolve<unknown>(depName));
        // Apply the factory function with resolved dependencies
        return factory(...resolvedDependencies);
    }

    /**
     * Clears all registrations and instances from the container.
     */
    clear(): void {
        this.registrations.clear();
        console.log('ServiceContainer cleared.');
    }
}

// --- Example Usage ---
async function demonstrateServiceContainer() {
    console.log('--- Demonstrating Service Container (DI) ---');
    const container = new ServiceContainer();

    // Define services with dependencies
    class Logger {
        log(message: string): void {
            console.log(`[Logger] ${message}`);
        }
    }

    class DatabaseService {
        private logger: Logger;
        constructor(logger: Logger) {
            this.logger = logger;
            this.logger.log('DatabaseService initialized.');
        }
        query(sql: string): Promise<unknown[]> {
            this.logger.log(`Executing query: ${sql}`);
            return Promise.resolve([{ id: 1, data: 'Sample data' }]);
        }
    }

    class UserService {
        private dbService: DatabaseService;
        private logger: Logger;
        constructor(dbService: DatabaseService, logger: Logger) {
            this.dbService = dbService;
            this.logger = logger;
            this.logger.log('UserService initialized.');
        }
        async getUser(id: string): Promise<unknown> {
            this.logger.log(`Getting user with ID: ${id}`);
            const records = await this.dbService.query(`SELECT * FROM users WHERE id = '${id}'`);
            return records.length > 0 ? records[0] : null;
        }
    }

    // Register services
    container.register('Logger', () => new Logger());
    container.register('DatabaseService', (logger: Logger) => new DatabaseService(logger), { dependencies: ['Logger'] });
    container.register('UserService', (dbService: DatabaseService, logger: Logger) => new UserService(dbService, logger), { dependencies: ['DatabaseService', 'Logger'] });

    // Resolve and use a service
    const userService = container.resolve<UserService>('UserService');
    const user = await userService.getUser('user-123');
    console.log('Resolved User:', user);

    // Demonstrate Singleton scope
    const logger1 = container.resolve<Logger>('Logger');
    const logger2 = container.resolve<Logger>('Logger');
    console.log('Are Logger instances the same (Singleton)?', logger1 === logger2); // Should be true

    // Demonstrate Transient scope (if registered)
    container.register('TransientLogger', () => new Logger(), { scope: Scope.Transient });
    const tl1 = container.resolve<Logger>('TransientLogger');
    const tl2 = container.resolve<Logger>('TransientLogger');
    console.log('Are TransientLogger instances the same (Transient)?', tl1 === tl2); // Should be false
}

demonstrateServiceContainer();
