/*
 * components/GraphVisualization.tsx
 *
 * A React component that visually renders the code dependency graph.
 * This component would typically use a library like D3.js, react-flow,
 * or similar for actual graph rendering.
 */

import React, { useEffect, useRef } from 'react';
import { GraphLayout } from '../lib/visualization/GraphLayoutEngine';
import { GraphNode } from '../lib/visualization/GraphNode';
import { NodeStyleManager } from '../lib/visualization/NodeStyleManager';

interface GraphVisualizationProps {
    layout: GraphLayout;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ layout }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const nodeStyleManager = new NodeStyleManager();

    useEffect(() => {
        if (!svgRef.current || layout.nodes.length === 0) {
            console.warn('GraphVisualization: SVG ref not available or no layout data.');
            return;
        }

        // --- Mock D3.js or other visualization library integration ---
        // In a real application, you would initialize and update a visualization here.
        // Example: Using D3.js for force simulation and rendering.

        console.log('[GraphVisualization] Mock rendering started.');
        const svg = svgRef.current;
        svg.innerHTML = ''; // Clear previous rendering

        // Simulate drawing nodes
        layout.nodes.forEach(node => {
            const style = nodeStyleManager.getStyle(node);
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(node.x || Math.random() * 500)); // Fallback to random if x is undefined
            circle.setAttribute('cy', String(node.y || Math.random() * 400)); // Fallback to random if y is undefined
            circle.setAttribute('r', String(style.size || 10));
            circle.setAttribute('fill', style.color || 'gray');
            circle.setAttribute('stroke', '#333');
            circle.setAttribute('stroke-width', '1.5');
            svg.appendChild(circle);

            // Add text label (simplified)
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', String(node.x || Math.random() * 500));
            text.setAttribute('y', String((node.y || Math.random() * 400) + (style.size || 10) + 5)); // Position below node
            text.setAttribute('font-size', '10px');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#333');
            text.textContent = node.label;
            svg.appendChild(text);
        });

        // Simulate drawing links (lines)
        layout.links.forEach(link => {
            const sourceNode = layout.nodes.find(n => n.id === link.source);
            const targetNode = layout.nodes.find(n => n.id === link.target);

            if (sourceNode && targetNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', String(sourceNode.x || 100));
                line.setAttribute('y1', String(sourceNode.y || 100));
                line.setAttribute('x2', String(targetNode.x || 300));
                line.setAttribute('y2', String(targetNode.y || 100));
                line.setAttribute('stroke', '#999');
                line.setAttribute('stroke-width', '1');
                svg.appendChild(line);
            }
        });

        console.log('[GraphVisualization] Mock rendering complete.');

        // --- Clean-up ---
        // In a real D3 implementation, you might return a cleanup function here.
        return () => {
            console.log('[GraphVisualization] Cleanup called.');
            // svg.innerHTML = ''; // Potentially clear on unmount
        };
    }, [layout]); // Re-run effect if layout data changes

    // SVG dimensions and basic styling
    const svgWidth = 800;
    const svgHeight = 600;

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
            <svg ref={svgRef} width={svgWidth} height={svgHeight} style={{ display: 'block', margin: 'auto' }}>
                {/* Nodes and links will be rendered by the useEffect hook */}
                <title>Code Dependency Graph</title>
            </svg>
            <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.9em', color: 'gray' }}>
                (Simplified graph visualization. Node colors indicate group, size is simulated complexity.)
            </div>
        </div>
    );
};

export default GraphVisualization;

// --- Example Usage (for testing outside a React environment) ---
async function demonstrateGraphVisualization() {
    console.log('--- Demonstrating Graph Visualization ---');

    // Mock GraphLayout data structure
    const mockLayout: GraphLayout = {
        nodes: [
            { id: 'src/main.ts', label: 'main.ts', group: 'Source', x: 100, y: 100, fx: 100, fy: 100 },
            { id: 'src/utils.ts', label: 'utils.ts', group: 'Source', x: 300, y: 100 },
            { id: 'src/components/Button.ts', label: 'Button.ts', group: 'Components', x: 300, y: 250 },
            { id: 'lib/core/index.ts', label: 'index.ts', group: 'Library', x: 500, y: 100 },
            { id: '@types/node', label: '@types/node', group: 'Other', x: 650, y: 50 },
            { id: 'react', label: 'react', group: 'Other', x: 650, y: 200 },
        ],
        links: [
            { source: 'src/main.ts', target: 'src/utils.ts', type: 'import' },
            { source: 'src/main.ts', target: 'src/components/Button.ts', type: 'import' },
            { source: 'src/components/Button.ts', target: 'src/utils.ts', type: 'import' },
            { source: 'src/components/Button.ts', target: 'react', type: 'import' },
            { source: 'lib/core/index.ts', target: 'lib/analysis/CodeAnalyzer', type: 'import' },
            { source: 'src/main.ts', target: 'lib/core/index.ts', type: 'import' },
        ],
    };

    console.log('Simulating GraphVisualization component rendering...');
    // In a real React app, this would be rendered within JSX.
    // We'll simulate the effect of the useEffect hook.
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '800');
    svgElement.setAttribute('height', '600');
    svgElement.style.display = 'block';
    svgElement.style.margin = 'auto';
    svgElement.style.border = '1px solid #ccc';
    svgElement.style.borderRadius = '4px';
    svgElement.style.overflow = 'hidden';

    // Mocking the DOM environment for testing purposes
    // This is a workaround and not a true React rendering simulation.
    const nodeStyleManager = new NodeStyleManager();
    const svg = svgElement;
    svg.innerHTML = ''; // Clear

    mockLayout.nodes.forEach(node => {
        const style = nodeStyleManager.getStyle(node);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(node.x));
        circle.setAttribute('cy', String(node.y));
        circle.setAttribute('r', String(style.size || 10));
        circle.setAttribute('fill', style.color || 'gray');
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '1.5');
        svg.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(node.x));
        text.setAttribute('y', String((node.y) + (style.size || 10) + 5));
        text.setAttribute('font-size', '10px');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#333');
        text.textContent = node.label;
        svg.appendChild(text);
    });

    mockLayout.links.forEach(link => {
        const sourceNode = mockLayout.nodes.find(n => n.id === link.source);
        const targetNode = mockLayout.nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(sourceNode.x));
            line.setAttribute('y1', String(sourceNode.y));
            line.setAttribute('x2', String(targetNode.x));
            line.setAttribute('y2', String(targetNode.y));
            line.setAttribute('stroke', '#999');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }
    });

    console.log('[GraphVisualization] Mock SVG content generated.');
    // In a real browser context, you would append 'svg' to the DOM.
    // For console, we can just note its creation.
    console.log(`SVG element created with ${svg.children.length} elements.`);
}

demonstrateGraphVisualization();
