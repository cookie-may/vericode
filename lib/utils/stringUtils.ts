// @ts-nocheck
/*
 * lib/utils/stringUtils.ts
 *
 * Provides utility functions for string manipulation, such as sanitization,
 * formatting, and case conversion.
 */

export class StringUtils {
    /**
     * Capitalizes the first letter of a string.
     * @param str The input string.
     * @returns The string with the first letter capitalized.
     */
    capitalize(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Converts a string to camelCase.
     * e.g., "hello world" -> "helloWorld"
     * e.g., "some_variable_name" -> "someVariableName"
     * @param str The input string.
     * @returns The camelCased string.
     */
    toCamelCase(str: string): string {
        return str.replace(/([-_ ]\w)/g, (match) => match.toUpperCase().replace(/[-_ ]/g, ''));
    }

    /**
     * Converts a string to PascalCase.
     * e.g., "hello world" -> "HelloWorld"
     * e.g., "some_variable_name" -> "SomeVariableName"
     * @param str The input string.
     * @returns The PascalCased string.
     */
    toPascalCase(str: string): string {
        return this.capitalize(this.toCamelCase(str));
    }

    /**
     * Truncates a string to a specified length, adding an ellipsis if truncated.
     * @param str The input string.
     * @param maxLength The maximum length of the returned string.
     * @param ellipsis The string to append if truncation occurs. Defaults to '...'.
     * @returns The truncated string.
     */
    truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
        if (str.length <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength) + ellipsis;
    }

    /**
     * Checks if a string is empty, null, or undefined.
     * @param str The input string.
     * @returns True if the string is considered empty, false otherwise.
     */
    isEmpty(str: string | null | undefined): boolean {
        return str == null || str.trim() === '';
    }
}

// --- Example Usage ---
function demonstrateStringUtils() {
    console.log('--- Demonstrating String Utilities ---');
    const utils = new StringUtils();

    const testString = 'hello world';
    const testSnakeCase = 'some_variable_name';
    const longString = 'This is a very long string that needs to be truncated for display purposes.';

    console.log(`Original: "${testString}"`);
    console.log('Capitalized:', utils.capitalize(testString));
    console.log('CamelCase:', utils.toCamelCase(testString));
    console.log('PascalCase:', utils.toPascalCase(testString));
    console.log('Truncated (20):', utils.truncate(longString, 20));
    console.log('Truncated (10, "---"):', utils.truncate(longString, 10, '---'));
    console.log(`Is "${testString}" empty?`, utils.isEmpty(testString));
    console.log(`Is "" empty?`, utils.isEmpty(''));
    console.log(`Is null empty?`, utils.isEmpty(null));

    console.log('\n--- Snake Case Tests ---');
    console.log(`Original: "${testSnakeCase}"`);
    console.log('CamelCase:', utils.toCamelCase(testSnakeCase));
    console.log('PascalCase:', utils.toPascalCase(testSnakeCase));
}

demonstrateStringUtils();
