/*
 * lib/config/AnalysisConfigLoader.ts
 *
 * Manages loading and providing configuration settings for the analysis engine.
 * Supports loading from different sources (e.g., JSON files, environment variables).
 */

// Removed 'import { type } from "os";' as it's not used and might cause issues in some environments.
// If OS-specific path handling is needed, it should be handled more robustly.

// Define the structure for analysis configuration
interface AnalysisConfig {
    targetFiles: string[]; // Glob patterns or list of files to analyze
    excludeFiles?: string[]; // Files/patterns to exclude
    rules: { // Configuration for different analysis modules
        complexity: { enabled: boolean; threshold: number };
        security: { enabled: boolean; rules: string[] };
        dependencies: { enabled: boolean; maxDepth: number };
        linting: { enabled: boolean; configPath?: string };
        typeChecking: { enabled: boolean };
    };
    outputFormat: 'json' | 'html' | 'markdown';
    outputFile?: string;
}

// Interface for configuration loaders
interface IConfigLoader {
    load(): Promise<Partial<AnalysisConfig>>;
}

// Loader for configuration from a JSON file
class JsonConfigLoader implements IConfigLoader {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    async load(): Promise<Partial<AnalysisConfig>> {
        console.log(`[ConfigLoader] Loading config from JSON: ${this.filePath}`);
        // Simulate loading from a file system
        const mockConfig: Partial<AnalysisConfig> = {
            targetFiles: ['*.ts', '*.tsx'],
            excludeFiles: ['node_modules/**', 'dist/**'],
            rules: {
                complexity: { enabled: true, threshold: 10 },
                security: { enabled: true, rules: ['common-vulnerabilities'] },
                dependencies: { enabled: true, maxDepth: 5 },
                linting: { enabled: true, configPath: '.eslintrc.js' },
                typeChecking: { enabled: true },
            },
            outputFormat: 'html',
        };
        // Simulate reading file content
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('[ConfigLoader] JSON config loaded.');
        return mockConfig;
    }
}

// Loader for configuration from environment variables
class EnvConfigLoader implements IConfigLoader {
    async load(): Promise<Partial<AnalysisConfig>> {
        console.log('[ConfigLoader] Loading config from environment variables.');
        // Simulate reading from process.env
        const mockConfig: Partial<AnalysisConfig> = {
            outputFormat: process.env.OUTPUT_FORMAT as AnalysisConfig['outputFormat'] || 'json',
            rules: {
                security: { enabled: process.env.ENABLE_SECURITY_SCAN === 'true', rules: [] },
                typeChecking: { enabled: process.env.ENABLE_TYPECHECK === 'true' },
            },
            outputFile: process.env.OUTPUT_FILE,
        };
        console.log('[ConfigLoader] Environment variable config loaded.');
        return mockConfig;
    }
}

// Main configuration manager
export class AnalysisConfigManager {
    private config: AnalysisConfig | null = null;
    private loaders: IConfigLoader[] = [];

    constructor(loaders: IConfigLoader[]) {
        this.loaders = loaders;
    }

    /**
     * Initializes the configuration by loading from all provided sources.
     * Later sources override earlier ones.
     */
    async initialize(): Promise<void> {
        console.log('[AnalysisConfigManager] Initializing configuration...');
        // Default configuration
        let mergedConfig: Partial<AnalysisConfig> = {
            targetFiles: ['**/*.{js,jsx,ts,tsx}'],
            excludeFiles: ['node_modules/**', 'dist/**', 'build/**'],
            rules: {
                complexity: { enabled: true, threshold: 15 },
                security: { enabled: false, rules: [] },
                dependencies: { enabled: true, maxDepth: 10 },
                linting: { enabled: false },
                typeChecking: { enabled: false },
            },
            outputFormat: 'markdown',
        };

        for (const loader of this.loaders) {
            const partialConfig = await loader.load();
            // Deep merge logic would be more robust, but shallow merge works for this example
            mergedConfig = { ...mergedConfig, ...partialConfig };
            // Merge rules specifically
            if (partialConfig.rules) {
                mergedConfig.rules = { ...mergedConfig.rules, ...partialConfig.rules };
                // Deep merge for nested rule properties if necessary
                if (partialConfig.rules.complexity) {
                    mergedConfig.rules!.complexity = { ...mergedConfig.rules!.complexity, ...partialConfig.rules.complexity };
                }
                 if (partialConfig.rules.security) {
                    mergedConfig.rules!.security = { ...mergedConfig.rules!.security, ...partialConfig.rules.security };
                }
                // ... other nested rule properties
            }
        }

        // Ensure all required fields are present and correctly typed
        this.config = {
            targetFiles: mergedConfig.targetFiles!,
            excludeFiles: mergedConfig.excludeFiles, // Optional field
            rules: {
                complexity: mergedConfig.rules!.complexity!,
                security: mergedConfig.rules!.security!,
                dependencies: mergedConfig.rules!.dependencies!,
                linting: mergedConfig.rules!.linting!,
                typeChecking: mergedConfig.rules!.typeChecking!,
            },
            outputFormat: mergedConfig.outputFormat!,
            outputFile: mergedConfig.outputFile, // Optional field
        };
        console.log('[AnalysisConfigManager] Configuration initialized.');
    }

    get<K extends keyof AnalysisConfig>(key: K): AnalysisConfig[K] {
        if (!this.config) {
            throw new Error("Configuration has not been initialized. Call initialize() first.");
        }
        return this.config[key];
    }

    getAll(): AnalysisConfig {
        if (!this.config) {
            throw new Error("Configuration has not been initialized. Call initialize() first.");
        }
        // Return a deep copy to prevent external modification
        return JSON.parse(JSON.stringify(this.config));
    }
}

// --- Example Usage ---
async function setupAnalysisConfig() {
    console.log('--- Setting up Analysis Configuration ---');

    // Mock environment variables if not in Node.js context
    if (typeof process === 'undefined') {
        // @ts-ignore
        global.process = { env: { ENABLE_SECURITY_SCAN: 'true', OUTPUT_FORMAT: 'html', ENABLE_TYPECHECK: 'true' } };
    }

    const jsonLoader = new JsonConfigLoader('config/analysis.json');
    const envLoader = new EnvConfigLoader();

    const configManager = new AnalysisConfigManager([jsonLoader, envLoader]);
    await configManager.initialize();

    console.log('
--- Loaded Configuration ---');
    console.log('Target Files:', configManager.get('targetFiles'));
    console.log('Output Format:', configManager.get('outputFormat'));
    console.log('Security Scan Enabled:', configManager.get('rules').security.enabled);
    console.log('Type Checking Enabled:', configManager.get('rules').typeChecking.enabled);
    console.log('Output File:', configManager.get('outputFile') || 'Not specified');

    const allConfig = configManager.getAll();
    console.log('
--- All Configuration (Deep Copy) ---');
    console.log(JSON.stringify(allConfig, null, 2));
}

setupAnalysisConfig();
