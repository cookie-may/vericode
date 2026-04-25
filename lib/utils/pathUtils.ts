/*
 * lib/utils/pathUtils.ts
 *
 * Utility functions for path manipulation, including resolving relative paths,
 * normalizing paths, and extracting path components.
 */

import * as path from 'path'; // Node.js path module

export class PathUtils {
    /**
     * Resolves a relative path against a base path.
     * @param basePath The base path.
     * @param relativePath The relative path to resolve.
     * @returns The resolved absolute path.
     */
    resolvePath(basePath: string, relativePath: string): string {
        console.log(`[PathUtils] Resolving "${relativePath}" against base "${basePath}"`);
        return path.resolve(basePath, relativePath);
    }

    /**
     * Extracts the directory name from a file path.
     * @param filePath The path to the file.
     * @returns The directory name.
     */
    getDirectoryName(filePath: string): string {
        console.log(`[PathUtils] Getting directory name for: ${filePath}`);
        return path.dirname(filePath);
    }

    /**
     * Extracts the base name (file name with extension) from a path.
     * @param filePath The path to the file.
     * @returns The base name.
     */
    getBaseName(filePath: string): string {
        console.log(`[PathUtils] Getting base name for: ${filePath}`);
        return path.basename(filePath);
    }

    /**
     * Extracts the file extension from a path.
     * @param filePath The path to the file.
     * @returns The file extension (including the dot), or an empty string if no extension.
     */
    getExtension(filePath: string): string {
        console.log(`[PathUtils] Getting extension for: ${filePath}`);
        return path.extname(filePath);
    }

    /**
     * Normalizes a path, resolving '..' and '.' segments.
     * @param inputPath The path to normalize.
     * @returns The normalized path.
     */
    normalizePath(inputPath: string): string {
        console.log(`[PathUtils] Normalizing path: ${inputPath}`);
        return path.normalize(inputPath);
    }
}

// --- Example Usage ---
function demonstratePathUtils() {
    console.log('--- Demonstrating Path Utilities ---');
    const pathUtils = new PathUtils();

    const currentDir = '/users/me/project/src';
    const relativeFilePath = '../components/Button.tsx';
    const absolutePath = '/users/me/project/src/components/Button.tsx';
    const pathWithSegments = '/users/me/project/./src/../components//Button.tsx';

    // Resolve path
    const resolved = pathUtils.resolvePath(currentDir, relativeFilePath);
    console.log('Resolved Path:', resolved); // Expected: /users/me/project/components/Button.tsx

    // Directory name
    const dirName = pathUtils.getDirectoryName(absolutePath);
    console.log('Directory Name:', dirName); // Expected: /users/me/project/src/components

    // Base name
    const baseName = pathUtils.getBaseName(absolutePath);
    console.log('Base Name:', baseName); // Expected: Button.tsx

    // Extension
    const ext = pathUtils.getExtension(absolutePath);
    console.log('Extension:', ext); // Expected: .tsx

    // Normalize path
    const normalized = pathUtils.normalizePath(pathWithSegments);
    console.log('Normalized Path:', normalized); // Expected: /users/me/project/components/Button.tsx
}

demonstratePathUtils();
