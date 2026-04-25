export interface IASTNode {
  type: string;
  start: number;
  end: number;
  children?: IASTNode[];
  [key: string]: unknown;
}

export interface IFileContext {
  filePath: string;
  content: string;
  language: string;
  ast?: IASTNode;
}

export interface IAnalysisResult {
  ruleId: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  line?: number;
  column?: number;
}

export interface IAnalyzer {
  analyze(context: IFileContext): Promise<IAnalysisResult[]>;
  getName(): string;
  getSupportedLanguages(): string[];
}

export interface IASTParser {
  parse(content: string, language: string): Promise<IASTNode>;
  supportsLanguage(language: string): boolean;
}

export interface IReportGenerator {
  generate(results: Map<string, IAnalysisResult[]>): Promise<string>;
  getExtension(): string;
}

export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
  debug(message: string): void;
}
