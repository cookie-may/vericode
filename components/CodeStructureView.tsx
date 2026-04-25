/*
 * components/CodeStructureView.tsx
 *
 * A React component to display the analyzed code structure, potentially as a
 * file tree or a simplified graph visualization.
 */

import React from 'react';
import { AnalysisResult } from '../lib/analysis/CodeAnalyzer';
import { GraphNode, GraphNodeFactory } from '../lib/visualization/GraphNode';
import { CodeGraphRenderer } from '../lib/visualization/CodeGraphRenderer'; // We'll use this to prepare data

interface CodeStructureViewProps {
    analysisResults: AnalysisResult[];
}

const CodeStructureView: React.FC<CodeStructureViewProps> = ({ analysisResults }) => {
    const [nodes, setNodes] = React.useState<GraphNode[]>([]);
    const [links, setLinks] = React.useState<unknown[]>([]); // Using 'unknown' for simplicity, could define Link type
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const prepareData = async () => {
            setIsLoading(true);
            // Use the renderer to prepare the data structure
            const renderer = new CodeGraphRenderer();
            renderer.prepareGraphData(analysisResults);

            // Access the prepared data (assuming renderer exposes it or we adapt)
            // For simplicity, we'll directly use a mock renderer instance here
            // In a real app, renderer might return data or have getters.
            // Let's simulate getting the data structure.

            // Mocking data preparation for demonstration purposes
            const nodeFactory = new GraphNodeFactory();
            const tempNodes: GraphNode[] = [];
            const tempLinks: unknown[] = [];
            const nodeMap = new Map<string, GraphNode>();

            analysisResults.forEach(result => {
                if (!nodeMap.has(result.filePath)) {
                    const node = nodeFactory.createNode(result.filePath, result.filePath.split('/').pop() || result.filePath);
                    tempNodes.push(node);
                    nodeMap.set(result.filePath, node);
                }
                result.dependencies.forEach(depPath => {
                    if (!nodeMap.has(depPath)) {
                        const depNode = nodeFactory.createNode(depPath, depPath.split('/').pop() || depPath);
                        tempNodes.push(depNode);
                        nodeMap.set(depPath, depNode);
                    }
                    tempLinks.push({ source: result.filePath, target: depPath, type: 'import' });
                });
            });

            setNodes(tempNodes);
            setLinks(tempLinks);
            setIsLoading(false);
        };

        prepareData();
    }, [analysisResults]);

    if (isLoading) {
        return <div>Loading code structure...</div>;
    }

    if (nodes.length === 0) {
        return <div>No code structure to display. Please run an analysis first.</div>;
    }

    // In a real React app, this would involve using a graph visualization library (e.g., react-flow, d3-react)
    // For this example, we'll just display the node and link counts and a summary.
    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
            <h2>Code Structure Visualization</h2>
            <p><strong>Total Nodes (Files/Modules):</strong> {nodes.length}</p>
            <p><strong>Total Links (Dependencies):</strong> {links.length}</p>

            <h3>Nodes:</h3>
            <ul style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {nodes.map((node) => (
                    <li key={node.id} style={{ marginBottom: '5px', fontSize: '0.9em', color: '#333' }}>
                        {node.label} <span style={{ fontSize: '0.8em', color: '#777' }}>({node.group})</span>
                    </li>
                ))}
            </ul>

            {/* Links are numerous, only showing count */}
            <p><em>(Link details omitted for brevity)</em></p>

            <p style={{ marginTop: '20px', fontSize: '0.9em', color: 'gray' }}>
                This is a simplified representation. A real implementation would use a dedicated graph library.
            </p>
        </div>
    );
};

export default CodeStructureView;

// --- Example Usage (for testing outside a React environment) ---
// This part would typically not be included in the final component file,
// but helps verify the component's logic in a Node.js environment.
async function demonstrateCodeStructureView() {
    console.log('--- Demonstrating Code Structure View ---');

    // Mock Analysis Results similar to what CodeAnalyzer would produce
    const mockAnalysisResults: AnalysisResult[] = [
        {
            filePath: 'src/main.ts',
            complexity: 5,
            securityWarnings: [],
            dependencies: ['src/utils.ts', 'src/components/Button.ts'],
            astSize: 100,
        },
        {
            filePath: 'src/utils.ts',
            complexity: 2,
            securityWarnings: [],
            dependencies: ['@types/node'],
            astSize: 50,
        },
        {
            filePath: 'src/components/Button.ts',
            complexity: 3,
            securityWarnings: [],
            dependencies: ['src/utils.ts', 'react'],
            astSize: 70,
        },
        {
            filePath: 'lib/core/index.ts',
            complexity: 8,
            securityWarnings: ['Sensitive env var access'],
            dependencies: ['lib/analysis/CodeAnalyzer'],
            astSize: 150,
        },
        {
            filePath: 'src/app.ts',
            complexity: 4,
            securityWarnings: [],
            dependencies: ['lib/core/index.ts', 'src/components/Button.ts'],
            astSize: 90,
        }
    ];

    console.log('Simulating rendering of CodeStructureView...');
    // We can't truly render React components in this environment,
    // but we can simulate the data preparation part.
    const renderer = new CodeGraphRenderer(); // Assuming this is imported/available
    renderer.prepareGraphData(mockAnalysisResults);
    const graphData = (renderer as unknown as Record<string, unknown>).graphData; // Accessing private member for demo

    if (graphData) {
        const componentProps: CodeStructureViewProps = { analysisResults: mockAnalysisResults };
        // Simulate the component's internal logic for data preparation
        const nodeFactory = new GraphNodeFactory();
        const tempNodes: GraphNode[] = [];
        const tempLinks: unknown[] = [];
        const nodeMap = new Map<string, GraphNode>();

        mockAnalysisResults.forEach(result => {
            if (!nodeMap.has(result.filePath)) {
                const node = nodeFactory.createNode(result.filePath, result.filePath.split('/').pop() || result.filePath);
                tempNodes.push(node);
                nodeMap.set(result.filePath, node);
            }
            result.dependencies.forEach(depPath => {
                if (!nodeMap.has(depPath)) {
                    const depNode = nodeFactory.createNode(depPath, depPath.split('/').pop() || depPath);
                    tempNodes.push(depNode);
                    nodeMap.set(depPath, depNode);
                }
                tempLinks.push({ source: result.filePath, target: depPath, type: 'import' });
            });
        });

        console.log('Simulated Nodes:', tempNodes.length);
        console.log('Simulated Links:', tempLinks.length);
        console.log('First few nodes:', tempNodes.slice(0, 3));
    } else {
        console.log('Graph data could not be prepared (mock renderer failed).');
    }
}

// To run the example usage in a Node.js environment, you would need:
// 1. A way to mock React hooks like useState and useEffect.
// 2. A way to mock the CodeGraphRenderer and its private members.
// For simplicity, we'll just log the simulated data preparation.
// demonstrateCodeStructureView();
