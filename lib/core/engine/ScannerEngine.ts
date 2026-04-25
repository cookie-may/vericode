import { IAnalysisResult, IAnalyzer, IASTParser, IFileContext, ILogger } from './interfaces';

export class ScannerEngine {
  private readonly analyzers: IAnalyzer[] = [];
  private readonly parser: IASTParser;
  private readonly logger: ILogger;

  constructor(parser: IASTParser, logger: ILogger) {
    this.parser = parser;
    this.logger = logger;
  }

  public registerAnalyzer(analyzer: IAnalyzer): void {
    this.analyzers.push(analyzer);
    this.logger.debug(`Registered analyzer: ${analyzer.getName()}`);
  }

  public async scanFiles(files: IFileContext[]): Promise<Map<string, IAnalysisResult[]>> {
    const report = new Map<string, IAnalysisResult[]>();

    for (const file of files) {
      this.logger.info(`Scanning file: ${file.filePath}`);
      const fileResults: IAnalysisResult[] = [];

      // Parse AST if language is supported
      if (this.parser.supportsLanguage(file.language)) {
        try {
          file.ast = await this.parser.parse(file.content, file.language);
        } catch (error) {
          this.logger.error(`Failed to parse ${file.filePath}`, error as Error);
          fileResults.push({
            ruleId: 'parse-error',
            severity: 'error',
            message: `Could not parse file: ${(error as Error).message}`
          });
          report.set(file.filePath, fileResults);
          continue; // Skip analyzers that might require AST
        }
      }

      // Run all applicable analyzers
      for (const analyzer of this.analyzers) {
        const supportedLangs = analyzer.getSupportedLanguages();
        if (supportedLangs.includes('*') || supportedLangs.includes(file.language.toLowerCase())) {
          try {
            const results = await analyzer.analyze(file);
            fileResults.push(...results);
          } catch (error) {
            this.logger.error(`Analyzer ${analyzer.getName()} failed on ${file.filePath}`, error as Error);
          }
        }
      }

      report.set(file.filePath, fileResults);
    }

    return report;
  }
}
