// @ts-nocheck
/*
 * lib/utils/fileSystemUtils.ts
 *
 * Utility functions for interacting with the file system, such as reading
 * directories, checking file existence, and manipulating paths.
 */

import * as fs from 'fs'; // Node.js file system module
import * as path from 'path'; // Node.js path module

export class FileSystemUtils {
    /**
     * Reads the content of a directory and returns a list of file paths.
     * @param dirPath The path to the directory to read.
     * @returns A promise resolving to an array of file paths.
     */
    async readDirectory(dirPath: string): Promise<string[]> {
        console.log(`[FileSystemUtils] Reading directory: ${dirPath}`);
        try {
            const files = await fs.promises.readdir(dirPath);
            const filePaths = files.map(file => path.join(dirPath, file));
            console.log(`[FileSystemUtils] Found ${filePaths.length} items in ${dirPath}.`);
            return filePaths;
        } catch (error) {
            console.error(`[FileSystemUtils] Error reading directory ${dirPath}:`, error);
            return [];
        }
    }

    /**
     * Checks if a file or directory exists at the given path.
     * @param itemPath The path to check.
     * @returns A promise resolving to true if the path exists, false otherwise.
     */
    async pathExists(itemPath: string): Promise<boolean> {
        console.log(`[FileSystemUtils] Checking existence of: ${itemPath}`);
        try {
            await fs.promises.access(itemPath, fs.constants.F_OK);
            console.log(`[FileSystemUtils] Path exists: ${itemPath}`);
            return true;
        } catch {
            console.log(`[FileSystemUtils] Path does not exist: ${itemPath}`);
            return false;
        }
    }

    /**
     * Creates a directory if it does not exist.
     * @param dirPath The path of the directory to create.
     * @returns A promise resolving when the directory is created or already exists.
     */
    async createDirectory(dirPath: string): Promise<void> {
        console.log(`[FileSystemUtils] Ensuring directory exists: ${dirPath}`);
        const exists = await this.pathExists(dirPath);
        if (!exists) {
            try {
                await fs.promises.mkdir(dirPath, { recursive: true });
                console.log(`[FileSystemUtils] Directory created: ${dirPath}`);
            } catch (error) {
                console.error(`[FileSystemUtils] Error creating directory ${dirPath}:`, error);
            }
        } else {
            console.log(`[FileSystemUtils] Directory already exists: ${dirPath}`);
        }
    }

    /**
     * Reads the content of a text file.
     * @param filePath The path to the file.
     * @returns A promise resolving to the file content, or an empty string on error.
     */
    async readFileContent(filePath: string): Promise<string> {
        console.log(`[FileSystemUtils] Reading file content: ${filePath}`);
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            console.log(`[FileSystemUtils] Successfully read ${content.length} characters from ${filePath}.`);
            return content;
        } catch (error) {
            console.error(`[FileSystemUtils] Error reading file ${filePath}:`, error);
            return '';
        }
    }

    /**
     * Writes content to a text file. Creates the directory if it doesn't exist.\n* @param filePath The path to the file.
     * @param content The content to write.
     * @returns A promise resolving when the file is written.
     */
    async writeFileContent(filePath: string, content: string): Promise<void> {
        console.log(`[FileSystemUtils] Writing to file: ${filePath}`);
        const dirPath = path.dirname(filePath);
        await this.createDirectory(dirPath); // Ensure directory exists

        try {
            await fs.promises.writeFile(filePath, content, 'utf-8');
            console.log(`[FileSystemUtils] Successfully wrote to ${filePath}.`);
        } catch (error) {
            console.error(`[FileSystemUtils] Error writing to file ${filePath}:`, error);
        }
    }
}

// --- Example Usage ---
async function demonstrateFileSystemUtils() {
    console.log('--- Demonstrating File System Utilities ---');
    const fsUtils = new FileSystemUtils();

    // Example directory path (relative to script execution)
    const exampleDir = 'temp_test_dir/subdir';
    const exampleFile = path.join(exampleDir, 'test_file.txt');
    const fileContent = 'Hello from FileSystemUtils!\nThis is a test file.';

    // 1. Create directory
    await fsUtils.createDirectory(exampleDir);

    // 2. Check path existence
    const dirExists = await fsUtils.pathExists(exampleDir);
    console.log(`Directory '${exampleDir}' exists: ${dirExists}`);

    // 3. Write file content
    await fsUtils.writeFileContent(exampleFile, fileContent);

    // 4. Check file existence after writing
    const fileExists = await fsUtils.pathExists(exampleFile);
    consoled.log(`File '${exampleFile}' exists: ${fileExists}`);

    // 5. Read file content
    const readContent = await fsUtils.readFileContent(exampleFile);
    console.log(`
Content read from ${exampleFile}:
---
${readContent}
---`);

    // 6. Read directory
    const itemsInDir = await fsUtils.readDirectory(exampleDir);
    console.log(`Items found in '${exampleDir}':`, itemsInDir);

    // Clean up: In a real test, you'd remove the created directory and file.\n// For this example, we'll omit cleanup to keep it simple.
    console.log('\n(Skipping cleanup for demonstration)');
}

// Note: fs and path are Node.js built-in modules.
// The example usage will only work in a Node.js environment.
demonstrateFileSystemUtils();
