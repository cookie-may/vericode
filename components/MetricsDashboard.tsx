/*
 * components/MetricsDashboard.tsx
 *
 * A React component to display aggregated metrics from code analysis.
 * It should visually represent key statistics like complexity, warnings, etc.
 */

import React from 'react';
import { AggregatedReportData } from '../lib/reporting/ReportAggregator'; // Import aggregated data type

interface MetricsDashboardProps {
    data: AggregatedReportData;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ data }) => {
    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#0056b3', borderBottom: '2px solid #0056b3', paddingBottom: '10px' }}>Analysis Metrics Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <MetricCard title="Total Files Analyzed" value={data.totalFiles} />
                <MetricCard title="Files with Issues" value={data.filesWithWarnings} color="#FF9800" />
                <MetricCard title="Total Complexity Score" value={data.totalComplexity} />
                <MetricCard title="Total Security Warnings" value={data.totalSecurityWarnings} color="#f44336" />
                <MetricCard title="Avg AST Nodes" value={data.averageAstSize} unit="nodes" />
            </div>

            {data.filesWithIssues.length > 0 && (
                <>
                    <h3 style={{ marginTop: '30px', marginBottom: '10px', color: '#007bff' }}>Files with Issues:</h3>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', padding: '15px', borderRadius: '4px', backgroundColor: '#fff' }}>
                        {data.filesWithIssues.map((issue, index) => (
                            <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #eee' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1em', color: '#dc3545' }}>{issue.filePath}</p>
                                <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#555' }}>{issue.warnings.length} warning(s):</p>
                                <ul style={{ marginLeft: '25px', fontSize: '0.85em', color: '#666' }}>
                                    {issue.warnings.map((warning, warnIndex) => (
                                        <li key={warnIndex}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}
             {!data.filesWithIssues || data.filesWithIssues.length === 0 && (
                <p>No specific file issues to display.</p>
             )}
        </div>
    );
};

interface MetricCardProps {
    title: string;
    value: number | string;
    unit?: string;
    color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit = '', color = '#2196F3' }) => {
    return (
        <div style={{ flex: '1 1 150px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'center', backgroundColor: color, color: 'white', minWidth: '150px' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9em', opacity: 0.8 }}>{title}</h4>
            <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold' }}>{value}{unit && ` ${unit}`}</p>
        </div>
    );
};

export default MetricsDashboard;

// --- Example Usage (for testing outside a React environment) ---
async function demonstrateMetricsDashboard() {
    console.log('--- Demonstrating Metrics Dashboard ---');

    // Mock Aggregated Report Data
    const mockAggregatedData: AggregatedReportData = {
        totalFiles: 150,
        filesWithWarnings: 15,
        totalComplexity: 1200,
        totalSecurityWarnings: 25,
        averageAstSize: 125.75,
        filesWithIssues: [
            { filePath: 'src/vulnerable.ts', warnings: ['Potential XSS', 'Hardcoded secret'] },
            { filePath: 'lib/utils.ts', warnings: ['Unused variable'] },
        ],
    };

    console.log('Simulating MetricsDashboard component rendering...');
    // We can't truly render React components in this environment.
    // We'll simulate the data preparation and display.
    console.log('Props received by MetricsDashboard:', { data: mockAggregatedData });

    // Expected Output Summary:
    // - Total Files Analyzed: 150
    // - Files with Issues: 15 (colored orange)
    // - Total Complexity Score: 1200
    // - Total Security Warnings: 25 (colored red)
    // - Avg AST Nodes: 125.75 nodes
    // - Files with Issues section listing details for src/vulnerable.ts and lib/utils.ts
}

// demonstrateMetricsDashboard(); // Uncomment to run example in a suitable environment
