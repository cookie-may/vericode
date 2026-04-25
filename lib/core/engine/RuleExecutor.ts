/*
 * lib/core/engine/RuleExecutor.ts
 *
 * Executes analysis rules against a given context. It's responsible for
 * applying a collection of registered rules and aggregating their findings.
 */

import { AnalysisRule } from './RuleEngine'; // Assuming AnalysisRule is defined in RuleEngine

// Placeholder for a rule context, which could contain AST, file content, etc.
type AnalysisContext = {
    filePath: string;
    ast?: any;
    codeContent?: string;
    dependencies?: string[];
    complexity?: number;
    securityWarnings?: string[];
    astNodeCount?: number;
};

export class RuleExecutor {
    private rules: Map<string, AnalysisRule> = new Map();

    /**
     * Registers an analysis rule to be executed.
     * @param rule The rule to register.
     */
    registerRule(rule: AnalysisRule): void {
        if (this.rules.has(rule.id)) {
            console.warn(`Rule with ID "${rule.id}" already exists. Overwriting.`);
        }
        this.rules.set(rule.id, rule);
        console.log(`[RuleExecutor] Registered rule: "${rule.name}" (ID: ${rule.id})`);
    }

    /**
     * Executes all registered rules against the provided context.
     * @param context The context to analyze.
     * @returns A promise resolving to a list of all findings from the executed rules.
     */
    async executeAll(context: AnalysisContext): Promise<any[]> {
        console.log(`[RuleExecutor] Executing ${this.rules.size} rules for file: ${context.filePath}`);
        const allFindings: any[] = [];

        const ruleExecutionPromises = Array.from(this.rules.values()).map(async rule => {
            try {
                // Apply rule only if it's relevant to the context provided
                if (context[rule.id] !== undefined || context.filePath) { // Basic check
                    const findings = await rule.execute(context);
                    allFindings.push(...findings);
                } else {
                    // console.log(`[RuleExecutor] Skipping rule "${rule.name}" due to insufficient context.`);
                }
            } catch (error) {
                console.error(`[RuleExecutor] Error executing rule "${rule.name}" (ID: ${rule.id}):`, error);
            }
        });

        await Promise.all(ruleExecutionPromises);
        console.log(`[RuleExecutor] All rules executed. Total findings: ${allFindings.length}`);
        return allFindings;
    }
}

// --- Example Usage ---
async function demonstrateRuleExecutor() {
    console.log('--- Demonstrating Rule Executor ---');
    const ruleExecutor = new RuleExecutor();

    // Mock rules (these would typically be imported or created elsewhere)
    const mockComplexityRule = {
        id: 'complexity',
        name: 'Cyclomatic Complexity Check',
        description: 'Checks complexity.',
        execute: async (context: AnalysisContext) => {
            if (context.complexity !== undefined && context.complexity > 10) {
                return [{ ruleId: this.id, message: `High complexity: ${context.complexity}`, level: 'warning' }];
            }
            return [];
        }
    };

    const mockSecurityRule = {
        id: 'securityWarnings',
        name: 'Security Scan Check',
        description: 'Checks for security issues.',
        execute: async (context: AnalysisContext) => {
            if (context.securityWarnings && context.securityWarnings.length > 0) {
                return context.securityWarnings.map(warning => ({ ruleId: this.id, message: warning, level: 'error' }));
            }
            return [];
        }
    };

    ruleExecutor.registerRule(mockComplexityRule);
    ruleExecutor.registerRule(mockSecurityRule);

    // Mock analysis context for a file
    const fileContext1: AnalysisContext = {
        filePath: 'src/complex/module.ts',
        complexity: 15,
        securityWarnings: ['Hardcoded password detected'],
        dependencies: ['lib/utils.ts'],
        astNodeCount: 200
    };

    const fileContext2: AnalysisContext = {
        filePath: 'src/utils.ts',
        complexity: 5,
        securityWarnings: [],
        dependencies: [],
        astNodeCount: 50
    };

    const findings1 = await ruleExecutor.executeAll(fileContext1);
    console.log('Findings for fileContext1:', findings1);

    const findings2 = await ruleExecutor.executeAll(fileContext2);
    console.log('Findings for fileContext2:', findings2);
}

demonstrateRuleExecutor();
