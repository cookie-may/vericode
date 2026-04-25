/*
 * lib/reporting/ReportAggregator.ts
 *
 * Aggregates results from multiple analysis modules and prepares them
 * for reporting. This helps in centralizing data before passing it
 * to formatters.
 */

import { AnalysisResult } from '../analysis/CodeAnalyzer';

// Represents the aggregated data before final formatting
export interface AggregatedReportData {
    totalFiles: number;
    filesWithWarnings: number;
    totalComplexity: number;
    totalSecurityWarnings: number;
    averageAstSize: number;
    // Could include a list of all files with warnings for quick overview
    filesWithIssues: Array<{ filePath: string; warnings: string[] }>;
}

export class ReportAggregator {
    /**
     * Aggregates analysis results into a summary format.
     * @param results An array of AnalysisResult objects.
     * @returns An AggregatedReportData object.
     */
    aggregate(results: AnalysisResult[]): AggregatedReportData {
        console.log(`[ReportAggregator] Aggregating ${results.length} analysis results.`);
        const totalFiles = results.length;
        let totalComplexity = 0;
        let totalSecurityWarnings = 0;
        let filesWithWarnings = 0;
        let totalAstSize = 0;
        const filesWithIssues: Array<{ filePath: string; warnings: string[] }> = [];

        results.forEach(result => {
            if (result.complexity > 0) {
                totalComplexity += result.complexity;
            }
            if (result.securityWarnings.length > 0) {
                filesWithWarnings++;
                totalSecurityWarnings += result.securityWarnings.length;
                filesWithIssues.push({ filePath: result.filePath, warnings: result.securityWarnings });
            }
            totalAstSize += result.astSize;
        });

        const averageAstSize = totalFiles > 0 ? totalAstSize / totalFiles : 0;

        const aggregatedData: AggregatedReportData = {
            totalFiles,
            filesWithWarnings,
            totalComplexity,
            totalSecurityWarnings,
            averageAstSize: parseFloat(averageAstSize.toFixed(2)), // Format to 2 decimal places
            filesWithIssues,
        };

        console.log('[ReportAggregator] Aggregation complete.');
        return aggregatedData;
    }
}

// --- Example Usage ---
async function demonstrateReportAggregator() {
    console.log('--- Demonstrating Report Aggregator ---');
    const aggregator = new ReportAggregator();

    // Mock Analysis Results
    const mockResults: AnalysisResult[] = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: [], astSize: 50 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret', 'SQL Injection risk'], dependencies: [], astSize: 150 },
        { filePath: 'src/api/client.ts', complexity: 3, securityWarnings: [], dependencies: ['lib/core/index.ts'], astSize: 75 },
    ];

    const aggregatedData = aggregator.aggregate(mockResults);

    console.log('
--- Aggregated Report Data ---');
    console.log(JSON.stringify(aggregatedData, null, 2));
}

demonstrateReportAggregator();
