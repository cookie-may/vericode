/*
 * lib/reporting/DetailedJsonReporter.ts
 *
 * Implements a reporter that generates a more detailed JSON report,
 * including aggregated metrics and specific details about warnings.
 */

import { Report, IReportFormatter } from './ReportGenerator';
import { AnalysisResult } from '../analysis/CodeAnalyzer';

export class DetailedJsonReporter implements IReportFormatter {
    format(report: Report): string {
        console.log(`[DetailedJsonReporter] Formatting report "${report.title}" as detailed JSON.`);
        const summary = this.generateSummary(report.results);

        return JSON.stringify({
            reportTitle: report.title,
            generatedTimestamp: report.generatedAt.toISOString(),
            summary: summary,
            analysisResults: report.results.map(result => ({
                ...result,
                // Ensure dependencies are strings for JSON compatibility
                dependencies: result.dependencies.join(', ')
            })),
        }, null, 2);
    }

    private generateSummary(results: AnalysisResult[]): Record<string, any> {
        const totalFiles = results.length;
        const totalComplexity = results.reduce((sum, r) => sum + (r.complexity > 0 ? r.complexity : 0), 0);
        const totalSecurityWarnings = results.reduce((sum, r) => sum + r.securityWarnings.length, 0);
        const filesWithWarnings = results.filter(r => r.securityWarnings.length > 0).length;
        const averageAstSize = totalFiles > 0 ? results.reduce((sum, r) => sum + r.astSize, 0) / totalFiles : 0;

        return {
            totalFilesAnalyzed: totalFiles,
            totalComplexityScore: totalComplexity,
            totalSecurityWarnings: totalSecurityWarnings,
            filesWithWarnings: filesWithWarnings,
            averageAstSize: averageAstSize.toFixed(2),
        };
    }
}

// --- Example Usage ---
async function demonstrateDetailedJsonReporter() {
    console.log('--- Demonstrating Detailed JSON Reporter ---');

    // Mock Analysis Results
    const mockResults: AnalysisResult[] = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: [], astSize: 50 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret', 'SQL Injection risk'], dependencies: [], astSize: 150 },
    ];

    const detailedJsonReporter = new DetailedJsonReporter();
    const reportData: Report = {
        title: 'Detailed Project Analysis',
        generatedAt: new Date(),
        results: mockResults,
    };

    const formattedReport = detailedJsonReporter.format(reportData);
    console.log('
--- Generated Detailed JSON Report ---');
    console.log(formattedReport);
}

demonstrateDetailedJsonReporter();
