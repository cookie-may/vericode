/*
 * lib/core/engine/ASTParser.ts
 *
 * Mock implementation of an Abstract Syntax Tree (AST) parser.
 * In a real scenario, this would use a library like 'typescript' or 'acorn'
 * to parse code into a structured tree representation.
 */

export class ASTParser {
    /**
     * Parses the given code content into an Abstract Syntax Tree.
     * @param code The source code string to parse.
     * @returns A mock AST object.
     */
    parse(code: string): unknown {
        // console.log('[ASTParser] Parsing code...');
        // Simulate parsing by returning a simple object representing the AST.
        // The 'body' property could represent the number of lines or key nodes.
        const lines = code.split('\n').filter(line => line.trim() !== '').length;
        return {
            type: 'Program',
            body: lines, // Simulating AST node count by line count for simplicity
            // In a real parser, this would be a complex tree structure.
        };
    }

    /**
     * Returns the number of nodes in the AST.
     * @param ast The AST object.
     * @returns The node count.
     */
    getASTNodeCount(ast: unknown): number {
        // console.log('[ASTParser] Getting AST node count...');
        // For this mock, we assume the 'body' property indicates node count.
        return ast?.body || 0;;
    }
}

// --- Example Usage ---
function demonstrateASTParser() {
    console.log('--- Demonstrating AST Parser ---');
    const parser = new ASTParser();

    const sampleCodeTS = `
// Sample TypeScript code
export interface User {
    id: string;
    name: string;
}

function greet(user: User): void {
    console.log("Hello, " + user.name + "!");
}
`;

    const sampleCodeJS = `
// Sample JavaScript code
function calculate(a, b) {
    return a + b;
}
const result = calculate(5, 10);
console.log(result);
`;

    const tsAST = parser.parse(sampleCodeTS);
    console.log('TypeScript AST Node Count:', parser.getASTNodeCount(tsAST));

    const jsAST = parser.parse(sampleCodeJS);
    console.log('JavaScript AST Node Count:', parser.getASTNodeCount(jsAST));
}

demonstrateASTParser();
