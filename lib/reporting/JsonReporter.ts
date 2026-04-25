// @ts-nocheck
/*
 * lib/reporting/JsonReporter.ts
 *
 * Implements a specific reporter for generating analysis results in JSON format.
 * This follows the Strategy pattern, providing a concrete formatter for the ReportGenerator.
 */

import { Report, IReportFormatter } from './ReportGenerator'; // Assuming Report and IReportFormatter are exported

export class JsonReporter implements IReportFormatter {
    format(report: Report): string {
        console.log(`[JsonReporter] Formatting report "${report.title}" as JSON.`);
        return JSON.stringify({
            reportTitle: report.title,
            generatedTimestamp: report.generatedAt.toISOString(),
            analysisResults: report.results.map(result => ({
                ...result,
                // Ensure dependencies are strings for JSON compatibility if they were complex objects
                dependencies: result.dependencies.join(', ')
            })),
            summary: {
                totalFiles: report.results.length,
                totalComplexity: report.results.reduce((sum, r) => sum + (r.complexity > 0 ? r.complexity : 0), 0),
                totalSecurityWarnings: report.results.reduce((sum, r) => sum + r.securityWarnings.length, 0),
            }
        }, null, 2);
    }
}

// --- Example Usage ---
async function demonstrateJsonReporter() {
    console.log('--- Demonstrating JSON Reporter ---');

    // Mock Analysis Results
    const mockResults = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: [], astSize: 50 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret'], dependencies: [], astSize: 150 },
    ];

    const reporter = new JsonReporter();
    const reportData: Report = {
        title: 'JSON Analysis Summary',
        generatedAt: new Date(),
        results: mockResults,
    };

    const formattedReport = reporter.format(reportData);
    console.log('\n--- Generated JSON Report ---');
    console.log(formattedReport);
}

demonstrateJsonReporter();
