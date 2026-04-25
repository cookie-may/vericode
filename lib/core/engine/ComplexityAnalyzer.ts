import { IAnalysisResult, IAnalyzer, IFileContext } from './interfaces';

export class ComplexityAnalyzer implements IAnalyzer {
  private readonly threshold: number;

  constructor(cyclomaticThreshold: number = 10) {
    this.threshold = cyclomaticThreshold;
  }

  public getName(): string {
    return 'CyclomaticComplexityAnalyzer';
  }

  public getSupportedLanguages(): string[] {
    return ['typescript', 'javascript', 'python', 'java', 'go', 'csharp'];
  }

  public async analyze(context: IFileContext): Promise<IAnalysisResult[]> {
    const results: IAnalysisResult[] = [];
    
    if (!context.ast) {
      return results;
    }

    // Traverse the AST to compute cyclomatic complexity
    // This is a placeholder demonstrating the Open/Closed Principle
    const complexity = this.calculateComplexity(context.ast);
    
    if (complexity > this.threshold) {
      results.push({
        ruleId: 'complexity-too-high',
        severity: 'warning',
        message: `Cyclomatic complexity is ${complexity}, which exceeds the threshold of ${this.threshold}. Consider refactoring.`,
        line: 1 // Extracted from AST node in real logic
      });
    }

    return results;
  }

  private calculateComplexity(ast: any): number {
    // Simulated complexity calculation based on pseudo-AST nodes
    let complexity = 1; // Base complexity
    
    // Simulate finding branching statements
    const textRepresentation = JSON.stringify(ast);
    const branches = (textRepresentation.match(/IfStatement|ForStatement|WhileStatement|SwitchCase|CatchClause/g) || []).length;
    
    return complexity + branches;
  }
}
