/*
 * lib/visualization/NodeStyleManager.ts
 *
 * Manages the styling of nodes in the dependency graph based on their properties
 * (e.g., group, complexity, security warnings).
 */

import { GraphNode } from './GraphNode';

// Interface for styling properties that can be applied to a node
interface NodeStyle {
    color?: string;
    size?: number;
    shape?: 'circle' | 'box' | 'ellipse';
    // Add other visual properties as needed
}

export class NodeStyleManager {
    /**
     * Determines the style for a given graph node based on its properties.
     * @param node The GraphNode object.
     * @returns A NodeStyle object defining visual properties.
     */
    getStyle(node: GraphNode): NodeStyle {
        const style: NodeStyle = {
            color: this.getColorByGroup(node.group),
            size: this.getSizeByComplexity(node.label), // Simulate complexity lookup
            shape: 'ellipse', // Default shape
        };

        // Example: Adjust style based on specific node properties
        if (node.label.includes('Security')) { // Assuming label might indicate security issues directly
            style.color = 'red';
            style.size = (style.size || 10) + 10; // Make security-related nodes larger
        }

        return style;
    }

    /**
     * Assigns a color based on the node's group.
     */
    private getColorByGroup(group: string): string {
        switch (group) {
            case 'Source': return '#4CAF50'; // Green
            case 'Library': return '#2196F3'; // Blue
            case 'Components': return '#FF9800'; // Orange
            case 'App': return '#9C27B0'; // Purple
            case 'Tests': return '#FFEB3B'; // Yellow
            case 'Public': return '#00BCD4'; // Cyan
            default: return '#9E9E9E'; // Grey for 'Other'
        }
    }

    /**
     * Simulates assigning a size based on complexity (derived from node label for demo).
     * In a real scenario, complexity would be part of the node data.
     */
    private getSizeByComplexity(label: string): number {
        // This is highly simplified. Complexity would come from analysis results.
        if (label.toLowerCase().includes('main') || label.toLowerCase().includes('index')) return 25;
        if (label.toLowerCase().includes('util')) return 15;
        return 20; // Default size
    }
}

// --- Example Usage ---
function demonstrateNodeStyleManager() {
    console.log('--- Demonstrating Node Style Manager ---');
    const styleManager = new NodeStyleManager();

    // Mock nodes with different groups and labels
    const nodes: GraphNode[] = [
        { id: 'src/main.ts', label: 'main.ts', group: 'Source' },
        { id: 'src/utils.ts', label: 'utils.ts', group: 'Source' },
        { id: 'src/components/Button.ts', label: 'Button.ts', group: 'Components' },
        { id: 'lib/core/index.ts', label: 'index.ts', group: 'Library' },
        { id: 'react', label: 'react', group: 'Other' },
        { id: 'lib/analysis/CodeAnalyzer.ts', label: 'CodeAnalyzer.ts', group: 'Library' }, // Example with internal dependency
        { id: 'src/app.ts', label: 'app.ts', group: 'App' },
        { id: 'tests/main.test.ts', label: 'main.test.ts', group: 'Tests' },
    ];

    nodes.forEach(node => {
        const style = styleManager.getStyle(node);
        console.log(`Node: '${node.label}' (Group: ${node.group}) -> Style:`, style);
    });

    // Example of a node that might have direct security warnings (simulated label)
    const securityNode: GraphNode = { id: 'src/vulnerable.ts', label: 'vulnerable.ts (SECURITY)', group: 'Source' };
    const securityStyle = styleManager.getStyle(securityNode);
    console.log(`Node: '${securityNode.label}' (Group: ${securityNode.group}) -> Style:`, securityStyle);
}

demonstrateNodeStyleManager();
