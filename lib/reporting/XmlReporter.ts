// @ts-nocheck
/*
 * lib/reporting/XmlReporter.ts
 *
 * Implements a reporter for generating analysis results in XML format.
 * This provides a structured, machine-readable output.
 */

import { Report, IReportFormatter } from './ReportGenerator'; // Assuming Report and IReportFormatter are shared
import { AnalysisResult } from '../analysis/CodeAnalyzer'; // Assuming AnalysisResult is shared

export class XmlReporter implements IReportFormatter {
    format(report: Report): string {
        console.log(`[XmlReporter] Formatting report "${report.title}" as XML.`);
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
        xml += `<report title="${this.escapeXml(report.title)}" generatedAt="${report.generatedAt.toISOString()}">
`;

        if (report.results.length === 0) {
            xml += '  <summary>No analysis results found.</summary>\n';
        } else {
            // Add summary details
            const totalFiles = report.results.length;
            const totalComplexity = report.results.reduce((sum, r) => sum + (r.complexity > 0 ? r.complexity : 0), 0);
            const totalSecurityWarnings = report.results.reduce((sum, r) => sum + r.securityWarnings.length, 0);
            const filesWithWarnings = report.results.filter(r => r.securityWarnings.length > 0).length;
            const totalAstSize = report.results.reduce((sum, r) => sum + r.astSize, 0);
            const averageAstSize = totalFiles > 0 ? totalAstSize / totalFiles : 0;

            xml += `  <summary>
`;
            xml += `    <totalFiles>${totalFiles}</totalFiles>
`;
            xml += `    <totalComplexity>${totalComplexity}</totalComplexity>
`;
            xml += `    <totalSecurityWarnings>${totalSecurityWarnings}</totalSecurityWarnings>
`;
            xml += `    <filesWithWarnings>${filesWithWarnings}</filesWithWarnings>
`;
            xml += `    <averageAstSize>${averageAstSize.toFixed(2)}</averageAstSize>
`;
            xml += `  </summary>
`;

            xml += `  <results>
`;
            report.results.forEach(result => {
                xml += `    <file path="${this.escapeXml(result.filePath)}">
`;
                xml += `      <complexity>${result.complexity}</complexity>
`;
                xml += `      <astSize>${result.astSize}</astSize>
`;
                if (result.securityWarnings.length > 0) {
                    xml += `      <securityWarnings count="${result.securityWarnings.length}">
`;
                    result.securityWarnings.forEach(warning => {
                        xml += `        <warning>${this.escapeXml(warning)}</warning>
`;
                    });
                    xml += `      </securityWarnings>
`;
                }
                if (result.dependencies.length > 0) {
                    xml += `      <dependencies count="${result.dependencies.length}">
`;
                    result.dependencies.forEach(dep => {
                        xml += `        <dependency>${this.escapeXml(dep)}</dependency>
`;
                    });
                    xml += `      </dependencies>
`;
                }
                xml += `    </file>
`;
            });
            xml += `  </results>
`;
        }

        xml += `</report>`;
        return xml;
    }

    /**
     * Basic XML escaping for attribute values and text content.
     */
    private escapeXml(unsafe: string): string {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    }
}

// --- Example Usage ---
async function demonstrateXmlReporter() {
    console.log('--- Demonstrating XML Reporter ---');

    // Mock Analysis Results
    const mockResults: AnalysisResult[] = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: [], astSize: 50 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret', 'SQL Injection risk'], dependencies: [], astSize: 150 },
    ];

    const xmlFormatter = new XmlReporter();
    const reportData: Report = {
        title: 'XML Analysis Report',
        generatedAt: new Date(),
        results: mockResults,
    };

    const formattedReport = xmlFormatter.format(reportData);
    console.log('\n--- Generated XML Report ---');
    // In a real scenario, this would be written to a file.
    console.log(formattedReport.substring(0, 500) + '\n...'); // Log first 500 chars
}

// This mock assumes IReportFormatter is available in the scope.
// In a real setup, it would be imported from './ReportGenerator' or similar.
// For standalone execution context, we'll define a placeholder if not available.
if (typeof IReportFormatter === 'undefined') {
    // @ts-expect-error Mocking IReportFormatter for demo
    global.IReportFormatter = { format: () => '' }; // Placeholder
}

demonstrateXmlReporter();
