const fs = require('fs');

const filesToFix = [
  'lib/analysis/CodeMetricCalculator.ts',
  'lib/analysis/CodeStyleAnalyzer.ts',
  'lib/analysis/DependencyCalculator.ts',
  'lib/analysis/LintingRuleRunner.ts',
  'lib/analysis/PerformanceAnalyzer.ts',
  'lib/analysis/TypeChecker.ts',
  'lib/config/AnalysisConfigLoader.ts',
  'lib/core/engine/ASTParser.ts',
  'lib/core/engine/AnalysisOrchestrator.ts',
  'lib/core/engine/RuleEngine.ts',
  'lib/core/engine/ScannerEngine.ts',
  'lib/generators/module-38.ts',
  'lib/reporting/DetailedJsonReporter.ts',
  'lib/reporting/HtmlReporter.ts',
  'lib/reporting/JsonReporter.ts',
  'lib/reporting/MarkdownReporter.ts',
  'lib/reporting/ReportAggregator.ts',
  'lib/reporting/ReportGenerator.ts',
  'lib/reporting/XmlReporter.ts',
  'lib/utils/fileSystemUtils.ts',
  'lib/utils/stringUtils.ts',
  'lib/visualization/GraphLayoutEngine.ts',
  'lib/analysis/CodeAnalyzer.ts',
];

function fixUnterminatedStrings(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Count unmatched single quotes (not escaped) to detect open string
    // Simple heuristic: if line has odd number of unescaped single quotes and no template literal
    const singleQuotes = (line.match(/(?<!\\)'/g) || []).length;
    const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;

    if (singleQuotes % 2 === 1 && i + 1 < lines.length) {
      // Open single-quoted string spans to next line
      const nextLine = lines[i + 1];
      result.push(line.trimEnd() + '\\n' + nextLine.trimStart());
      i += 2;
    } else if (doubleQuotes % 2 === 1 && i + 1 < lines.length) {
      // Open double-quoted string spans to next line
      const nextLine = lines[i + 1];
      result.push(line.trimEnd() + '\\n' + nextLine.trimStart());
      i += 2;
    } else {
      result.push(line);
      i++;
    }
  }
  return result.join('\n');
}

let totalFixed = 0;
filesToFix.forEach(f => {
  if (!fs.existsSync(f)) { console.log('MISSING:', f); return; }
  const content = fs.readFileSync(f, 'utf8');
  const fixed = fixUnterminatedStrings(content);
  if (fixed !== content) {
    fs.writeFileSync(f, fixed, 'utf8');
    totalFixed++;
    console.log('Fixed:', f);
  } else {
    console.log('No change:', f);
  }
});
console.log('Total files modified:', totalFixed);
