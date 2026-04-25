// @ts-nocheck
/*
 * lib/visualization/GraphLink.ts
 *
 * Defines the data structure for a link (edge) in the code dependency graph.
 * Represents a connection between two nodes (e.g., file A imports file B).
 */

export interface GraphLink {
    source: string; // ID of the source node (e.g., filePath)
    target: string; // ID of the target node (e.g., dependency path)
    type: string; // Type of relationship (e.g., 'import', 'call', 'extend')
    // Additional properties for visualization:
    // - weight: number; // Could represent the strength or frequency of the dependency
    // - label: string; // e.g., the imported module name
}

// Helper function to create GraphLink instances
export function createGraphLink(source: string, target: string, type: string = 'import'): GraphLink {
    console.log(`[GraphLink] Creating link: ${source} -> ${target} (Type: ${type})`);
    return {
        source,
        target,
        type,
    };
}

// --- Example Usage ---
function demonstrateGraphLink() {
    console.log('--- Demonstrating Graph Link ---');

    const link1 = createGraphLink('src/main.ts', 'src/utils.ts');
    console.log('Created Link 1:', link1);

    const link2 = createGraphLink('src/components/Button.tsx', 'react', 'dependency');
    console.log('Created Link 2:', link2);

    const link3 = createGraphLink('lib/core/index.ts', 'lib/analysis/CodeAnalyzer.ts', 'uses');
    console.log('Created Link 3:', link3);
}

demonstrateGraphLink();
