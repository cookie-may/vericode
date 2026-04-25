import { IAnalysisResult, IReportGenerator } from './interfaces';

export class JSONReporter implements IReportGenerator {
  public async generate(results: Map<string, IAnalysisResult[]>): Promise<string> {
    const reportObject: Record<string, IAnalysisResult[]> = {};
    
    for (const [filePath, fileResults] of results.entries()) {
      reportObject[filePath] = fileResults;
    }

    return JSON.stringify(
      {
        version: '1.0',
        timestamp: new Date().toISOString(),
        findings: reportObject,
        summary: this.generateSummary(results)
      },
      null,
      2
    );
  }

  public getExtension(): string {
    return '.json';
  }

  private generateSummary(results: Map<string, IAnalysisResult[]>) {
    let errors = 0;
    let warnings = 0;
    let infos = 0;

    for (const fileResults of results.values()) {
      for (const result of fileResults) {
        switch (result.severity) {
          case 'error': errors++; break;
          case 'warning': warnings++; break;
          case 'info': infos++; break;
        }
      }
    }

    return {
      totalFilesScanned: results.size,
      totalIssues: errors + warnings + infos,
      errors,
      warnings,
      infos
    };
  }
}

export class MarkdownReporter implements IReportGenerator {
  public async generate(results: Map<string, IAnalysisResult[]>): Promise<string> {
    let markdown = '# Vericode Analysis Report\n\n';
    markdown += `Generated on: ${new Date().toUTCString()}\n\n`;

    let totalIssues = 0;
    for (const fileResults of results.values()) {
      totalIssues += fileResults.length;
    }

    markdown += `## Summary\n- Files analyzed: ${results.size}\n- Total issues found: ${totalIssues}\n\n`;
    markdown += `## Findings\n\n`;

    if (totalIssues === 0) {
      markdown += 'No issues found! Great job.\n';
      return markdown;
    }

    for (const [filePath, fileResults] of results.entries()) {
      if (fileResults.length === 0) continue;

      markdown += `### \`${filePath}\`\n\n`;
      markdown += '| Severity | Rule | Message | Line |\n';
      markdown += '|----------|------|---------|------|\n';

      for (const result of fileResults) {
        const severityIcon = result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️' : 'ℹ️';
        markdown += `| ${severityIcon} ${result.severity} | \`${result.ruleId}\` | ${result.message} | ${result.line || 'N/A'} |\n`;
      }
      markdown += '\n';
    }

    return markdown;
  }

  public getExtension(): string {
    return '.md';
  }
}
