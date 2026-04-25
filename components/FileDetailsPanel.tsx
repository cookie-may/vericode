/*
 * components/FileDetailsPanel.tsx
 *
 * A React component designed to display detailed information about a
 * selected file or code element within the analysis results. This could
 * include metrics, warnings, dependencies, etc.
 */

import React, { useEffect, useState } from 'react';
import { CodeMetrics } from '../lib/analysis/CodeMetricCalculator'; // Assuming this type is defined

interface FileDetailsPanelProps {
    fileMetrics?: CodeMetrics; // Optional metrics data for the selected file
    isLoading?: boolean;
    error?: string | null;
}

const FileDetailsPanel: React.FC<FileDetailsPanelProps> = ({ fileMetrics, isLoading = false, error = null }) => {
    const [metrics, setMetrics] = useState<CodeMetrics | null>(fileMetrics || null);

    // Update state if the fileMetrics prop changes
    useEffect(() => {
        setMetrics(fileMetrics || null);
    }, [fileMetrics]);

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fdfdfd', color: '#333', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#0056b3', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                {metrics ? `Details for: ${metrics.filePath}` : 'Select a File'}
            </h3>

            {isLoading && <p>Loading file details...</p>}
            {error && <p style={{ color: 'red' }}>Error loading details: {error}</p>}

            {!isLoading && !error && !metrics && (
                <p>No file selected or details available. Please select a file from the analysis results.</p>
            )}

            {!isLoading && !error && metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <DetailItem title="File Path" value={metrics.filePath} />
                    <DetailItem title="Lines of Code" value={metrics.lineCount} />
                    <DetailItem title="Cyclomatic Complexity" value={metrics.complexity === -1 ? 'N/A' : metrics.complexity} />
                    <DetailItem title="AST Node Count" value={metrics.astNodeCount} />
                </div>
            )}
        </div>
    );
};

interface DetailItemProps {
    title: string;
    value: number | string;
}

const DetailItem: React.FC<DetailItemProps> = ({ title, value }) => {
    return (
        <div style={{ padding: '12px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fff' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#555' }}>{title}</h4>
            <p style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold', color: '#007bff' }}>{value}</p>
        </div>
    );
};

export default FileDetailsPanel;

// --- Example Usage (for testing outside a React environment) ---
async function demonstrateFileDetailsPanel() {
    console.log('--- Demonstrating File Details Panel ---');

    // Mock CodeMetrics data
    const sampleMetrics: CodeMetrics = {
        filePath: 'src/components/MyComponent.tsx',
        lineCount: 150,
        complexity: 12,
        astNodeCount: 350,
    };

    console.log('Simulating FileDetailsPanel rendering with sample metrics:');
    console.log('File Path:', sampleMetrics.filePath);
    console.log('Lines of Code:', sampleMetrics.lineCount);
    console.log('Cyclomatic Complexity:', sampleMetrics.complexity);
    console.log('AST Node Count:', sampleMetrics.astNodeCount);

    console.log('Simulating loading state:');
    console.log('isLoading: true');

    console.log('Simulating error state:');
    console.log('error: "Failed to fetch data."');
}

// demonstrateFileDetailsPanel(); // Uncomment to run example
