/*
 * lib/visualization/GraphNodeStyleMapper.ts
 *
 * Maps graph node properties to visual styles for rendering.
 * This helps in ensuring consistent and informative visual representation
 * of nodes based on their characteristics like group, complexity, or warnings.
 */

import { GraphNode } from './GraphNode';
// Assuming NodeStyle is defined in './NodeStyleManager' or similar, for demonstration, define inline.
interface NodeStyle {
    color?: string;
    size?: number;
    shape?: 'circle' | 'box' | 'ellipse';
    // Add other visual properties as needed
}

export class GraphNodeStyleMapper {
    /**
     * Maps a GraphNode object to its visual style properties.
     * @param node The GraphNode to style.
     * @returns A NodeStyle object.
     */
    getMappedStyle(node: GraphNode): NodeStyle {
        // Default style
        let style: NodeStyle = {
            color: this.getColorByGroup(node.group),
            size: this.getSizeBasedOnLabel(node.label), // Simulate size based on label length for demo
            shape: 'circle',
        };

        // Enhance style based on specific conditions (e.g., security warnings)
        if (node.label.toLowerCase().includes('security') || node.group === 'Security') {
            style.color = 'red';
            style.size = (style.size || 15) + 15; // Make security nodes more prominent
            style.shape = 'box'; // Use a different shape for emphasis
        } else if (node.group === 'Library') {
            style.shape = 'ellipse';
        }

        return style;
    }

    /**
     * Determines node color based on its group.
     */
    private getColorByGroup(group: string): string {
        switch (group) {
            case 'Source': return '#4CAF50'; // Green
            case 'Library': return '#2196F3'; // Blue
            case 'Components': return '#FF9800'; // Orange
            case 'App': return '#9C27B0'; // Purple
            case 'Tests': return '#FFEB3B'; // Yellow
            case 'Public': return '#00BCD4'; // Cyan
            case 'Other': return '#9E9E9E'; // Grey
            default: return '#607D8B'; // Blue Grey for unknown groups
        }
    }

    /**
     * Simulates determining node size based on label length.
     * In a real app, this would use complexity or other metrics.
     */
    private getSizeBasedOnLabel(label: string): number {
        const baseSize = 15;
        const lengthFactor = Math.max(0, label.length - 10) / 5; // Scale length contribution
        return baseSize + lengthFactor * 5;
    }
}

// --- Example Usage ---
function demonstrateGraphNodeStyleMapper() {
    console.log('--- Demonstrating Graph Node Style Mapper ---');
    const styleMapper = new GraphNodeStyleManager();

    // Mock nodes with different groups and labels
    const nodes: GraphNode[] = [
        { id: 'src/main.ts', label: 'main.ts', group: 'Source' },
        { id: 'src/utils.ts', label: 'utils.ts', group: 'Source' },
        { id: 'src/components/Button.ts', label: 'Button.ts', group: 'Components' },
        { id: 'lib/core/index.ts', label: 'index.ts', group: 'Library' },
        { id: 'react', label: 'react', group: 'Other' },
        { id: 'lib/analysis/CodeAnalyzer.ts', label: 'CodeAnalyzer.ts', group: 'Library' },
        { id: 'src/app.ts', label: 'app.ts', group: 'App' },
        { id: 'tests/main.test.ts', label: 'main.test.ts', group: 'Tests' },
        { id: 'src/security/vulnerabilities.ts', label: 'vulnerabilities.ts (SECURITY)', group: 'Source' },
    ];

    nodes.forEach(node => {
        const style = styleMapper.getMappedStyle(node);
        console.log(`Node: '${node.label}' (Group: ${node.group}) -> Style:`, style);
    });
}

demonstrateGraphNodeStyleMapper();
