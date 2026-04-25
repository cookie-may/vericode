/*
 * app/analysis/results/page.tsx
 *
 * This component displays the results of a code analysis. It fetches
 * analysis data and renders it using the CodeStructureView.
 * This is a Next.js page component.
 */

'use client';

import React, { useEffect, useState } from 'react';
import CodeStructureView from '@/components/CodeStructureView'; // Adjust path as necessary
import { AnalysisResult } from '../../lib/analysis/CodeAnalyzer'; // Import AnalysisResult type
import { CodeAnalyzer } from '../../lib/analysis/CodeAnalyzer'; // Assuming CodeAnalyzer is the main entry point

// Mock function to simulate fetching analysis results
// In a real app, this would involve API calls or reading from a file/store
async function fetchAnalysisResults(): Promise<AnalysisResult[]> {
    console.log('[Page] Fetching analysis results...');
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data similar to what CodeAnalyzer might produce
    const mockResults: AnalysisResult[] = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts', 'src/components/Button.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: ['@types/node'], astSize: 50 },
        { filePath: 'src/components/Button.ts', complexity: 3, securityWarnings: [], dependencies: ['src/utils.ts', 'react'], astSize: 70 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret'], dependencies: ['lib/analysis/CodeAnalyzer'], astSize: 150 },
        { filePath: 'src/app.ts', complexity: 4, securityWarnings: [], dependencies: ['lib/core/index.ts', 'src/components/Button.ts'], astSize: 90 },
        { filePath: 'lib/analysis/CodeAnalyzer.ts', complexity: 6, securityWarnings: [], dependencies: ['lib/core/engine/ASTParser.ts', 'lib/analysis/DependencyCalculator.ts'], astSize: 120 },
        { filePath: 'lib/analysis/DependencyCalculator.ts', complexity: 4, securityWarnings: [], dependencies: ['lib/visualization/GraphNode.ts'], astSize: 80 },
        { filePath: 'lib/visualization/GraphNode.ts', label: 'GraphNode.ts', group: 'Library', id: 'lib/visualization/GraphNode.ts' , complexity: 1, securityWarnings: [], dependencies: [], astSize: 40}, // Mock node data structure
        { filePath: 'lib/visualization/CodeGraphRenderer.ts', complexity: 7, securityWarnings: [], dependencies: ['lib/visualization/GraphNode.ts', 'lib/analysis/CodeAnalyzer.ts'], astSize: 130 },
    ];
    console.log(`[Page] Fetched ${mockResults.length} analysis results.`);
    return mockResults;
}

const AnalysisResultsPage: React.FC = () => {
    const [analysisData, setAnalysisData] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadResults = async () => {
            try {
                setLoading(true);
                const results = await fetchAnalysisResults();
                setAnalysisData(results);
                setError(null);
            } catch (err: any) {
                console.error("Failed to load analysis results:", err);
                setError("Failed to load analysis results. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1>Code Analysis Report</h1>
            {loading && <p>Loading analysis data...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && analysisData.length === 0 && (
                <p>No analysis data available.</p>
            )}
            {!loading && !error && analysisData.length > 0 && (
                <CodeStructureView analysisResults={analysisData} />
            )}
        </div>
    );
};

export default AnalysisResultsPage;

// --- Example Usage (for running this file directly) ---
// In a Next.js app, this component would be rendered by the framework.
// For standalone execution, we can simulate its behavior.
async function demonstrateAnalysisResultsPage() {
    console.log('--- Simulating AnalysisResultsPage Component ---');

    // We can't directly render React components in this environment.
    // Instead, we'll simulate the data fetching and processing logic.

    const mockAnalysisData = await fetchAnalysisResults();

    if (mockAnalysisData.length > 0) {
        console.log(`Simulated fetching ${mockAnalysisData.length} analysis results.`);
        // Simulate the CodeStructureView rendering logic
        const nodeFactory = new GraphNodeFactory();
        const renderer = new CodeGraphRenderer(); // Need mock or actual renderer
        // Mocking renderer interaction for data prep
        const mockNodes: GraphNode[] = [];
        const mockLinks: any[] = [];
        const nodeMap = new Map<string, GraphNode>();

        mockAnalysisResults.forEach(result => {
            if (!nodeMap.has(result.filePath)) {
                const node = nodeFactory.createNode(result.filePath, result.filePath.split('/').pop() || result.filePath);
                mockNodes.push(node);
                nodeMap.set(result.filePath, node);
            }
            result.dependencies.forEach(depPath => {
                 // Simplified dependency node creation
                if (!nodeMap.has(depPath)) {
                    const depNode = nodeFactory.createNode(depPath, depPath.split('/').pop() || depPath);
                    mockNodes.push(depNode);
                    nodeMap.set(depPath, depNode);
                }
                mockLinks.push({ source: result.filePath, target: depPath, type: 'import' });
            });
        });

        console.log('Simulated nodes for CodeStructureView:', mockNodes.length);
        console.log('Simulated links for CodeStructureView:', mockLinks.length);
        console.log('Example Node:', mockNodes[0]);
    } else {
        console.log('No analysis data simulated.');
    }
}

// To run the example usage, ensure necessary mocks/imports are available or adapt.
// demonstrateAnalysisResultsPage();
