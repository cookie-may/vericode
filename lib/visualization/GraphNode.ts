// @ts-nocheck
/*
 * lib/visualization/GraphNode.ts
 *
 * Defines the data structure for a node in the code dependency graph.
 * This represents a single file, module, or component within the codebase.
 */

// Minimal interface for a graph node
export interface GraphNode {
    id: string; // Unique identifier (e.g., file path)
    label: string; // Display name
    group: string; // Category for visualization (e.g., 'Source', 'Library', 'Component')
    // Additional properties for visualization:
    // - size: number; // Could represent file size or complexity
    // - color: string; // Could represent security warnings or complexity level
    // - shape: 'circle' | 'box' | 'ellipse';
}

// Helper class to create GraphNode instances easily
export class GraphNodeFactory {
    /**
     * Creates a graph node, assigning a default group based on path.
     * @param id The unique ID of the node (e.g., file path).
     * @param label The display label for the node.
     * @returns A new GraphNode object.
     */
    createNode(id: string, label: string): GraphNode {
        const group = this.getNodeGroup(id);
        return {
            id,
            label,
            group,
        };
    }

    /**
     * Determines the group for a node based on its path.
     * Used for visual differentiation in the graph.
     * @param filePath The path of the file or module.
     * @returns The assigned group name.
     */
    private getNodeGroup(filePath: string): string {
        if (filePath.startsWith('src/')) return 'Source';
        if (filePath.startsWith('lib/')) return 'Library';
        if (filePath.startsWith('components/')) return 'Components';
        if (filePath.startsWith('app/')) return 'App';
        if (filePath.startsWith('tests/') || filePath.includes('test') || filePath.includes('spec')) return 'Tests';
        if (filePath.startsWith('public/')) return 'Public';
        return 'Other'; // Default group for unclassified paths
    }
}

// --- Example Usage ---
function demonstrateGraphNodeFactory() {
    console.log('--- Demonstrating GraphNode Factory ---');
    const nodeFactory = new GraphNodeFactory();

    const node1 = nodeFactory.createNode('src/main.ts', 'main.ts');
    console.log('Created Node 1:', node1);

    const node2 = nodeFactory.createNode('lib/core/engine/ScannerEngine.ts', 'ScannerEngine.ts');
    console.log('Created Node 2:', node2);

    const node3 = nodeFactory.createNode('components/ui/button.tsx', 'button.tsx');
    console.log('Created Node 3:', node3);

    const node4 = nodeFactory.createNode('tests/analyzer.test.ts', 'analyzer.test.ts');
    console.log('Created Node 4:', node4);
}

demonstrateGraphNodeFactory();
