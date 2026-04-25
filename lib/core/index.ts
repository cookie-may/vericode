// @ts-nocheck
// Core Engine Exports
export * from './engine/interfaces';
export * from './engine/ScannerEngine';
export * from './engine/ASTParser';
export * from './engine/ComplexityAnalyzer';
export * from './engine/SecurityAnalyzer';
export * from './engine/Reporters';

// Dependency Injection Exports
export * from './di/Container';

// Utility for bootstraping a standard scanner instance
import { ScannerEngine } from './engine/ScannerEngine';
import { AdvancedASTParser } from './engine/ASTParser';
import { ComplexityAnalyzer } from './engine/ComplexityAnalyzer';
import { SecurityAnalyzer } from './engine/SecurityAnalyzer';
import { Container } from './di/Container';
import { ILogger } from './engine/interfaces';

export function createStandardScanner(logger: ILogger): ScannerEngine {
  const container = new Container();
  
  // Register basic services
  container.register<ILogger>('Logger', logger);
  
  container.registerFactory('ASTParser', (c) => new AdvancedASTParser(c.resolve<ILogger>('Logger')));
  
  container.registerFactory('ScannerEngine', (c) => {
    const engine = new ScannerEngine(
      c.resolve<AdvancedASTParser>('ASTParser'),
      c.resolve<ILogger>('Logger')
    );
    
    // Register default analyzers
    engine.registerAnalyzer(new ComplexityAnalyzer(15));
    engine.registerAnalyzer(new SecurityAnalyzer());
    
    return engine;
  });

  return container.resolve<ScannerEngine>('ScannerEngine');
}
