/*
 * lib/reporting/MarkdownReporter.ts
 *
 * Implements a reporter for generating analysis results in Markdown format.
 * This provides a human-readable summary suitable for README files or documentation.
 */

import { Report, IReportFormatter } from './ReportGenerator';
import { AnalysisResult } from '../analysis/CodeAnalyzer';

export class MarkdownReportFormatter implements IReportFormatter {
    format(report: Report): string {
        console.log(`[MarkdownReportFormatter] Formatting report "${report.title}" as Markdown.`);
        let markdown = `# ${report.title}

`;
        markdown += `_Generated at: ${report.generatedAt.toLocaleString()}_

`;

        markdown += `## Summary
`;
        const totalFiles = report.results.length;
        const totalComplexity = report.results.reduce((sum, r) => sum + (r.complexity > 0 ? r.complexity : 0), 0);
        const totalSecurityWarnings = report.results.reduce((sum, r) => sum + r.securityWarnings.length, 0);
        markdown += `- **Total Files Analyzed:** ${totalFiles}
`;
        markdown += `- **Total Complexity Score:** ${totalComplexity}
`;
        markdown += `- **Total Security Warnings:** ${totalSecurityWarnings}

`;

        markdown += `## Analysis Results (${totalFiles} files)

`;

        if (report.results.length === 0) {
            markdown += 'No analysis results found.
';
            return markdown;
        }

        report.results.forEach(result => {
            markdown += `### File: `${result.filePath}`
`;
            markdown += `- **Complexity:** ${result.complexity}
`;
            markdown += `- **AST Nodes:** ${result.astSize}
`;
            if (result.securityWarnings.length > 0) {
                markdown += `- **Security Warnings:** <span style="color: red;">${result.securityWarnings.join('; ')}</span>
`;
            }
            if (result.dependencies.length > 0) {
                markdown += `- **Dependencies:** ${result.dependencies.join(', ')}
`;
            }
            markdown += '
';
        });
        return markdown;
    }
}

// --- Example Usage ---
async function demonstrateMarkdownReporter() {
    console.log('--- Demonstrating Markdown Reporter ---');

    // Mock Analysis Results
    const mockResults: AnalysisResult[] = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: [], astSize: 50 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret'], dependencies: [], astSize: 150 },
    ];

    const markdownFormatter = new MarkdownReportFormatter();
    const markdownReporter = new ReportGenerator(markdownFormatter); // Reusing ReportGenerator structure
    const markdownReport = markdownReporter.generateReport('Markdown Analysis Report', mockResults);

    console.log('
--- Generated Markdown Report ---');
    console.log(markdownReport);
}

demonstrateMarkdownReporter();
