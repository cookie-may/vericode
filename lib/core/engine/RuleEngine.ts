/*
 * lib/core/engine/RuleEngine.ts
 *
 * Manages the execution of analysis rules. It loads rules, applies them
 * to analysis results, and collects findings. Supports different rule types.
 */

// Define a generic structure for a rule
interface AnalysisRule {
    id: string;
    name: string;
    description: string;
    execute(context: unknown): Promise<unknown[]>; // Context could be file content, AST, etc.
}

// Mock rule for complexity checks
class ComplexityRule implements AnalysisRule {
    id = 'complexity-check';
    name = 'Cyclomatic Complexity Check';
    description = 'Checks if cyclomatic complexity exceeds a threshold.';

    async execute(context: { astSize: number; complexity: number }): Promise<unknown[]> {
        const issues: unknown[] = [];
        if (context.complexity > 10) { // Example threshold
            issues.push({
                rule: thisThis.id,
                message: `High cyclomatic complexity (${context.complexity}). Consider refactoring.`,
                level: 'warning',
            });
        }
        return issues;
    }
}

// Mock rule for security checks
class SecurityRule implements AnalysisRule {
    id = 'security-scan';
    name = 'Basic Security Scan';
    description = 'Scans for common security vulnerabilities.';

    async execute(context: { securityWarnings: string[] }): Promise<unknown[]> {
        const issues: unknown[] = [];
        context.securityWarnings.forEach(warning => {
            issues.push({
                rule: this.id,
                message: warning,
                level: 'error',
            });
        });
        return issues;
    }
}

// The Rule Engine orchestrator
export class RuleEngine {
    private rules: Map<string, AnalysisRule> = new Map();

    /**
     * Registers an analysis rule.
     * @param rule The rule to register.
     */
    registerRule(rule: AnalysisRule): void {
        if (this.rules.has(rule.id)) {
            console.warn(`Rule with ID "${rule.id}" already exists. Overwriting.`);
        }
        this.rules.set(rule.id, rule);
        console.log(`Registered rule: "${rule.name}" (ID: ${rule.id})`);
    }

    /**
     * Executes all registered rules against the provided context.
     * @param context Data to be analyzed by the rules (e.g., file AST, content).
     * @returns A promise resolving to a list of all found issues.
     */
    async runRules(context: unknown): Promise<unknown[]> {
        console.log(`[RuleEngine] Running ${this.rules.size} registered rules...`);
        const allIssues: unknown[] = [];

        const ruleExecutionPromises = Array.from(this.rules.values()).map(async rule => {
            try {
                const ruleIssues = await rule.execute(context);
                allIssues.push(...ruleIssues);
            } catch (error) {
                console.error(`[RuleEngine] Error executing rule "${rule.name}" (ID: ${rule.id}):`, error);
            }
        });

        await Promise.all(ruleExecutionPromises);
        console.log(`[RuleEngine] All rules executed. Found ${allIssues.length} issues.`);
        return allIssues;
    }
}

// --- Example Usage ---
async function demonstrateRuleEngine() {
    console.log('--- Demonstrating Rule Engine ---');
    const ruleEngine = new RuleEngine();

    // Register rules
    ruleEngine.registerRule(new ComplexityRule());
    ruleEngine.registerRule(new SecurityRule());

    // Simulate analysis context for a file
    const mockAnalysisContext = {
        filePath: 'src/complex/module.ts',
        complexity: 15, // High complexity
        securityWarnings: ['Hardcoded password detected'],
        dependencies: ['lib/utils.ts'],
        astSize: 200,
    };

    // Run rules against the context
    const issues = await ruleEngine.runRules(mockAnalysisContext);

    console.log('\n--- Rule Engine Findings ---');
    if (issues.length === 0) {
        console.log('No issues found by the rule engine.');
    } else {
        issues.forEach(issue => {
            console.log(`- Rule: ${issue.rule} (${issue.message}, Level: ${issue.level || 'info'})`);
        });
    }
}

demonstrateRuleEngine();
