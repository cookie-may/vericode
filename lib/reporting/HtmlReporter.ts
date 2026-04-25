/*
 * lib/reporting/HtmlReporter.ts
 *
 * Implements a reporter for generating analysis results in HTML format.
 * This module provides a basic HTML structure for viewing the analysis data.
 */

import { Report, IReportFormatter } from './ReportGenerator';

export class HtmlReportFormatter implements IReportFormatter {
    format(report: Report): string {
        console.log(`[HtmlReportFormatter] Formatting report "${report.title}" as HTML.`);
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; margin: 20px; background-color: #f4f4f4; color: #333; }
        .container { max-width: 960px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #0056b3; }
        h1 { border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        h2 { margin-top: 30px; }
        .file-item { border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 4px; background-color: #fafafa; }
        .file-item h3 { margin-top: 0; color: #007bff; }
        .file-item p { margin: 5px 0; }
        .file-item strong { color: #555; }
        .warnings { color: #dc3545; font-weight: bold; }
        .dependencies { color: #28a745; }
        .summary { margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 4px; }
        .summary p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${report.title}</h1>
        <p><em>Generated at: ${report.generatedAt.toLocaleString()}</em></p>

        <h2>Analysis Results (${report.results.length} files)</h2>
`;

        if (report.results.length === 0) {
            html += '<p>No analysis results found.</p>';
        } else {
            report.results.forEach(result => {
                html += `
        <div class="file-item">
            <h3>${result.filePath}</h3>
            <p><strong>Complexity:</strong> ${result.complexity}</p>
            <p><strong>AST Nodes:</strong> ${result.astSize}</p>`;

                if (result.securityWarnings.length > 0) {
                    html += `<p class="warnings"><strong>Security Warnings:</strong> ${result.securityWarnings.join('; ')}</p>`;
                }
                if (result.dependencies.length > 0) {
                    html += `<p class="dependencies"><strong>Dependencies:</strong> ${result.dependencies.join(', ')}</p>`;
                }
                html += `
        </div>`;
            });
        }

        // Summary section
        const totalComplexity = report.results.reduce((sum, r) => sum + (r.complexity > 0 ? r.complexity : 0), 0);
        const totalSecurityWarnings = report.results.reduce((sum, r) => sum + r.securityWarnings.length, 0);
        html += `
        <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Files Analyzed:</strong> ${report.results.length}</p>
            <p><strong>Total Complexity Score:</strong> ${totalComplexity}</p>
            <p><strong>Total Security Warnings:</strong> ${totalSecurityWarnings}</p>
        </div>`;

        html += `
    </div>
</body>
</html>`;
        return html;
    }
}

// --- Example Usage ---
async function demonstrateHtmlReporter() {
    console.log('--- Demonstrating HTML Reporter ---');

    // Mock Analysis Results
    const mockResults = [
        { filePath: 'src/main.ts', complexity: 5, securityWarnings: [], dependencies: ['src/utils.ts'], astSize: 100 },
        { filePath: 'src/utils.ts', complexity: 2, securityWarnings: ['Potential XSS'], dependencies: [], astSize: 50 },
        { filePath: 'lib/core/index.ts', complexity: 8, securityWarnings: ['Hardcoded secret'], dependencies: [], astSize: 150 },
    ];

    const htmlFormatter = new HtmlReportFormatter();
    const htmlReporter = new ReportGenerator(htmlFormatter); // Reusing ReportGenerator from previous module
    const htmlReport = htmlReporter.generateReport('HTML Analysis Report', mockResults);

    console.log('
--- Generated HTML Report (Content Below) ---');
    // In a real scenario, this would be written to an HTML file.
    // For console output, we'll just log a snippet.
    console.log(htmlReport.substring(0, 500) + '
...'); // Log first 500 chars
    console.log('--- End of HTML Report Snippet ---');
}

demonstrateHtmlReporter();
