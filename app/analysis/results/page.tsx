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
import { AnalysisResult } from '@/lib/analysis/CodeAnalyzer';
import { CodeAnalyzer } from '@/lib/analysis/CodeAnalyzer';

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
        { filePath: 'lib/visualization/GraphNode.ts', complexity: 1, securityWarnings: [], dependencies: [], astSize: 40 },
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