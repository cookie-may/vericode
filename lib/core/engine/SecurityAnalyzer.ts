import { IAnalysisResult, IAnalyzer, IFileContext } from './interfaces';

export class SecurityAnalyzer implements IAnalyzer {
  // Regex patterns for detecting potential hardcoded secrets
  private readonly secretPatterns: RegExp[] = [
    /api[_-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{16,})['"]/i,
    /password['"]?\s*[:=]\s*['"]([^'"]+)['"]/i,
    /secret['"]?\s*[:=]\s*['"]([^'"]+)['"]/i,
    /token['"]?\s*[:=]\s*['"](ghp_[a-zA-Z0-9]{36}|xox[baprs]-[0-9]{10,13}-[a-zA-Z0-9]{24})['"]/i
  ];

  public getName(): string {
    return 'HardcodedSecretsAnalyzer';
  }

  public getSupportedLanguages(): string[] {
    return ['*']; // Supports all languages as it analyzes raw text
  }

  public async analyze(context: IFileContext): Promise<IAnalysisResult[]> {
    const results: IAnalysisResult[] = [];
    const lines = context.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of this.secretPatterns) {
        if (pattern.test(line)) {
          results.push({
            ruleId: 'hardcoded-secret',
            severity: 'error',
            message: 'Potential hardcoded secret or credential detected in source code.',
            line: i + 1,
            column: line.search(pattern)
          });
        }
      }
    }

    return results;
  }
}
