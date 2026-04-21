const fs = require('fs');
let content = fs.readFileSync('lib/parser.ts', 'utf8');

// Insert extractCode only if it doesn't exist
if (!content.includes('private static extractCode')) {
  const extractCodeMethod = `
  private static extractCode(lines: string[], startLine: number, endLine?: number): string {
    const code: string[] = [];
    const start = Math.max(0, startLine - 1);
    const end = Math.min(lines.length, endLine || startLine + 20);
    for (let i = start; i < end && code.length < 15; i++) {
        code.push(lines[i]);
    }
    if (code.length >= 15) code.push('  // ...');
    return code.join('\\n');
  }

  private static extractJavaScript`;
  content = content.replace('  private static extractJavaScript', extractCodeMethod);
}

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("type: 'function'") || lines[i].includes("type: 'arrow'") || lines[i].includes("type: 'method'") || lines[i].includes("type: 'class'")) {
        if (!lines[i-1].includes('code:')) {
            lines[i] = "          code: this.extractCode(lines, line),\n" + lines[i];
        }
    }
}
fs.writeFileSync('lib/parser.ts', lines.join('\n'));
