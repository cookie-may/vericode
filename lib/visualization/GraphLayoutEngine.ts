/*
 * lib/visualization/GraphLayoutEngine.ts
 *
 * Handles the logic for positioning nodes and links in the dependency graph.
 * This module could integrate with libraries like D3.js force simulation
 * or implement simpler layout algorithms.
 */

import { GraphNode } from './GraphNode'; // Assuming GraphNode interface/class is defined

interface GraphLink {
    source: string; // Corresponds to GraphNode.id
    target: string; // Corresponds to GraphNode.id
}

// Represents the computed layout positions for nodes and links
interface GraphLayout {
    nodes: Array<GraphNode & { x: number; y: number; fx?: number; fy?: number }>;
    links: Array<GraphLink & { /* layout-specific properties like curvature */ }>;
}

export class GraphLayoutEngine {
    private nodes: GraphNode[] = [];
    private links: GraphLink[] = [];

    /**
     * Sets the graph data (nodes and links) for layout calculation.
     * @param nodes Array of graph nodes.
     * @param links Array of graph links.
     */
    setData(nodes: GraphNode[], links: GraphLink[]): void {
        this.nodes = nodes;
        this.links = links;
        console.log(`[GraphLayoutEngine] Data set with ${nodes.length} nodes and ${links.length} links.`);
    }

    /**
     * Calculates a force-directed layout for the graph.
     * This is a simplified simulation; a real implementation would use a physics engine.
     * @returns A promise resolving to the calculated graph layout.
     */
    async calculateForceDirectedLayout(): Promise<GraphLayout> {
        if (this.nodes.length === 0) {
            console.warn('[GraphLayoutEngine] No nodes available for layout calculation.');
            return { nodes: [], links: [] };
        }

        console.log('[GraphLayoutEngine] Calculating force-directed layout...');
        const layoutNodes = this.nodes.map(node => ({
            ...node,
            x: Math.random() * 800, // Initial random positions
            y: Math.random() * 600,
            fx: undefined, // Force X (can be used to fix nodes)
            fy: undefined, // Force Y
        }));

        const layoutLinks = this.links;

        // Simulate layout convergence (in a real engine, this would be iterative)
        // For simplicity, we'll just adjust positions slightly and add some randomness.
        for (let i = 0; i < 50; i++) { // Simulate a few iterations
            layoutNodes.forEach(node => {
                // Simple repulsion/attraction simulation (very basic)
                // Push nodes apart
                layoutNodes.forEach(otherNode => {
                    if (node.id !== otherNode.id) {
                        const dx = node.x - otherNode.x;
                        const dy = node.y - otherNode.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1; // Avoid division by zero
                        const force = 10 / (dist * dist); // Repulsion force
                        node.x += (dx / dist) * force;
                        node.y += (dy / dist) * force;
                    }
                });

                // Pull nodes towards linked targets (simplified attraction)
                layoutLinks.forEach(link => {
                    let targetNode: typeof node | undefined;
                    if (link.source === node.id) {
                        targetNode = layoutNodes.find(n => n.id === link.target);
                    } else if (link.target === node.id) {
                        targetNode = layoutNodes.find(n => n.id === link.source);
                    }

                    if (targetNode) {
                        const dx = targetNode.x - node.x;
                        const dy = targetNode.y - node.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const force = 0.1 / dist; // Attraction force
                        node.x += (dx / dist) * force;
                        node.y += (dy / dist) * force;
                    }
                });
                 // Boundary constraints (simple example)
                node.x = Math.max(20, Math.min(780, node.x));
                node.y = Math.max(20, Math.min(580, node.y));
            });
        }


        console.log('[GraphLayoutEngine] Layout calculation complete.');
        return { nodes: layoutNodes, links: layoutLinks };
    }

    /**
     * Applies a fixed, non-simulated layout (e.g., for initial placement or specific structures).
     * @param fixedNodes Array of nodes with predefined x, y coordinates.
     */
    applyFixedLayout(fixedNodes: Array<{id: string, x: number, y: number}>): GraphLayout {
        console.log('[GraphLayoutEngine] Applying fixed layout...');
        const layoutNodes = this.nodes.map(node => {
            const fixedPos = fixedNodes.find(fn => fn.id === node.id);
            return {
                ...node,
                x: fixedPos ? fixedPos.x : Math.random() * 800,
                y: fixedPos ? fixedPos.y : Math.random() * 600,
                fx: fixedPos ? fixedPos.x : undefined, // Fix the node position
                fy: fixedPos ? fixedPos.y : undefined,
            };
        });
        console.log('[GraphLayoutEngine] Fixed layout applied.');
        return { nodes: layoutNodes, links: this.links };
    }
}

// --- Example Usage ---
async function demonstrateGraphLayoutEngine() {
    console.log('--- Demonstrating Graph Layout Engine ---');

    const layoutEngine = new GraphLayoutEngine();

    // Mock graph data
    const mockNodes: GraphNode[] = [
        { id: 'src/main.ts', label: 'main.ts', group: 'Source' },
        { id: 'src/utils.ts', label: 'utils.ts', group: 'Source' },
        { id: 'src/components/Button.ts', label: 'Button.ts', group: 'Components' },
        { id: 'lib/core/index.ts', label: 'index.ts', group: 'Library' },
        { id: '@types/node', label: '@types/node', group: 'Other' },
        { id: 'react', label: 'react', group: 'Other' },
    ];
    const mockLinks: GraphLink[] = [
        { source: 'src/main.ts', target: 'src/utils.ts', type: 'import' },
        { source: 'src/main.ts', target: 'src/components/Button.ts', type: 'import' },
        { source: 'src/components/Button.ts', target: 'src/utils.ts', type: 'import' },
        { source: 'src/components/Button.ts', target: 'react', type: 'import' },
        { source: 'lib/core/index.ts', target: 'lib/analysis/CodeAnalyzer', type: 'import' }, // Assuming CodeAnalyzer is in lib/analysis
        { source: 'src/main.ts', target: 'lib/core/index.ts', type: 'import' },
    ];

    layoutEngine.setData(mockNodes, mockLinks);

    console.log('
--- Calculating Force-Directed Layout ---');
    const forceLayout = await layoutEngine.calculateForceDirectedLayout();
    console.log('Force-directed layout result (first node):', forceLayout.nodes[0]);

    console.log('
--- Applying Fixed Layout ---');
    const fixedPositions = [
        { id: 'src/main.ts', x: 100, y: 100 },
        { id: 'src/utils.ts', x: 300, y: 100 },
        // ... other fixed positions
    ];
    const fixedLayout = layoutEngine.applyFixedLayout(fixedPositions);
    console.log('Fixed layout result (first node):', fixedLayout.nodes[0]);
    console.log('Fixed layout result (node with fixed position):', fixedLayout.nodes.find(n => n.id === 'src/main.ts'));
}

demonstrateGraphLayoutEngine();
