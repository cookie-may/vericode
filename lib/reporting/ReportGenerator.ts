// @ts-nocheck
/*
 * lib/reporting/ReportGenerator.ts
 *
 * Provides a unified interface for generating analysis reports in various formats.
 * This module adheres to SOLID principles by abstracting report generation logic
 * and allowing different reporters to be plugged in.
 */

import { AnalysisResult } from '../analysis/CodeAnalyzer'; // Assuming AnalysisResult is available

// Defines the structure of a generated report
export interface Report {
    title: string;
    generatedAt: Date;
    results: AnalysisResult[];
    // Add other report-specific metadata
}

// Interface for different report formatters
export interface IReportFormatter {
    format(report: Report): string;
}

// Formatter for JSON output
export class JsonReportFormatter implements IReportFormatter {
    format(report: Report): string {
        console.log(`[JsonReportFormatter] Formatting report "${report.title}" as JSON.`);
        return JSON.stringify({
            reportTitle: report.title,
            generatedTimestamp: report.generatedAt.toISOString(),
            analysisResults: report.results,
        }, null, 2);
    }
}

// Formatter for Markdown output
export class MarkdownReportFormatter implements IReportFormatter {
    format(report: Report): string {
        console.log(`[MarkdownReportFormatter] Formatting report "${report.title}" as Markdown.`);
        let markdown = `# ${report.title}

`;
        markdown += `_Generated at: ${report.generatedAt.toLocaleString()}_

`;
        markdown += `## Analysis Results (${report.results.length} files)

`;

        if (report.results.length === 0) {
            markdown += 'No analysis results found.\n';
            return markdown;
        }

        report.results.forEach(result => {
            markdown += `### File: ${result.filePath}\n`;
            markdown += `- **Complexity:** ${result.complexity}\n`;
            markdown += `- **AST Nodes:** ${result.astSize}\n`;
            if (result.securityWarnings.length > 0) {
                markdown += `- **Security Warnings:** ${result.securityWarnings.join('; ')}\n`;
            }
            if (result.dependencies.length > 0) {
                markdown += `- **Dependencies:** ${result.dependencies.join(', ')}
`;
            }
            markdown += '\n';
        });
        return markdown;
    }
}

// The main Report Generator service
export class ReportGenerator {
    private formatter: IReportFormatter;

    constructor(formatter: IReportFormatter) {
        this.formatter = formatter;
    }

    /**
     * Generates a report from analysis results.
     * @param title The title of the report.
     * @param analysisResults The data to include in the report.
     * @returns The formatted report string.
     */
    generateReport(title: string, analysisResults: AnalysisResult[]): string {
        const report: Report = {
            title,
            generatedAt: new Date(),
            results: analysisResults,
        };
        return this.formatter.format(report);;
    }
}

// --- Example Usage ---
async function demonstrateReportGenerationModule() {
    console.log('--- Demonstrating Report Generation Module ---');

    // Mock Analysis Results
    const mockResults: AnalysisResult[] = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: [], astSize: 50 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret'], dependencies: [], astSize: 150 },
    ];

    // Using JSON formatter
    const jsonFormatter = new JsonReportFormatter();
    const jsonReporter = new ReportGenerator(jsonFormatter);
    const jsonReport = jsonReporter.generateReport('Project Analysis Report (JSON)', mockResults);
    console.log('\n--- JSON Report ---');
    console.log(jsonReport);

    // Using Markdown formatter
    const mdFormatter = new MarkdownReportFormatter();
    const mdReporter = new ReportGenerator(mdFormatter);
    const mdReport = mdReporter.generateReport('Project Analysis Report (Markdown)', mockResults);
    console.log('\n--- Markdown Report ---');
    console.log(mdReport);
}

demonstrateReportGenerationModule();
