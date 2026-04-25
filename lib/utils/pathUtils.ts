/*
 * lib/utils/pathUtils.ts
 *
 * Provides utility functions for handling file paths and module resolution
 * within the codebase. This is crucial for analysis tools that need to
 * understand the project structure.
 */

import path from 'path'; // Node.js path module for robust path manipulation

/**
 * Resolves a relative path against a base file path.
 * @param basePath The path of the file making the import.
 * @param relativePath The relative path specified in the import statement.
 * @returns The absolute path of the imported module.
 */
export function resolveModulePath(basePath: string, relativePath: string): string {
    // Ensure path.resolve is used for cross-platform compatibility
    const resolvedPath = path.resolve(path.dirname(basePath), relativePath);
    console.log(`[PathUtils] Resolved '${relativePath}' against '${basePath}' to '${resolvedPath}'`);
    return resolvedPath;
}

/**
 * Normalizes a file path to use consistent separators (e.g., forward slashes).
 * @param filePath The path to normalize.
 * @returns The normalized path.
 */
export function normalizePath(filePath: string): string {
    const normalized = filePath.replace(/\/g, '/'); // Replace backslashes with forward slashes
    console.log(`[PathUtils] Normalized path: '${filePath}' -> '${normalized}'`);
    return normalized;
}

/**
 * Extracts the directory name from a file path.
 * @param filePath The path to the file.
 * @returns The directory path.
 */
export function getDirectoryName(filePath: string): string {
    const dirName = path.dirname(filePath);
    console.log(`[PathUtils] Directory name for '${filePath}': '${dirName}'`);
    return dirName;
}

/**
 * Gets the file extension of a path.
 * @param filePath The path to the file.
 * @returns The file extension (e.g., '.ts', '.js').
 */
export function getFileExtension(filePath: string): string {
    const ext = path.extname(filePath);
    console.log(`[PathUtils] Extension for '${filePath}': '${ext}'`);
    return ext;
}

// --- Example Usage ---
async function demonstratePathUtils() {
    console.log('--- Demonstrating Path Utilities ---');

    const currentFile = '/Users/user/project/src/analysis/CodeAnalyzer.ts';
    const relativeImport = '../utils';
    const absoluteImport = 'react'; // Example of an absolute or module import

    // Resolve relative path
    const resolvedRelative = resolveModulePath(currentFile, relativeImport);
    console.log('Resolved Relative Path:', resolvedRelative);

    // Normalize path (e.g., if path came from Windows)
    const windowsPath = 'C:\Users\user\project\src\index.ts';
    const normalized = normalizePath(windowsPath);
    console.log('Normalized Path:', normalized);

    // Get directory name
    const dir = getDirectoryName(currentFile);
    console.log('Directory Name:', dir);

    // Get file extension
    const ext = getFileExtension(currentFile);
    console.log('File Extension:', ext);

    // Example with absolute path resolution (might need actual file system context)
    // For demonstration, we'll just use path.resolve directly
    const resolvedAbsolute = path.resolve('/Users/user/project', absoluteImport);
    console.log(`Resolved absolute path for '${absoluteImport}' against root: '${resolvedAbsolute}'`);
}

// Running the example usage
// Note: path module is a Node.js built-in. For browser env, path-browserify or similar would be needed.
// The console logs demonstrate the functionality.
demonstratePathUtils();
