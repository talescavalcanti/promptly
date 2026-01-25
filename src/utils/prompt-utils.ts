/**
 * Detects variables in the format {{variable_name}} within a string.
 * Returns an array of unique variable names.
 */
export function extractVariables(text: string): string[] {
    // Matches {{anything_inside}}
    // The capture group ([\w\s-]+) allows letters, numbers, spaces, and hyphens.
    const regex = /\{\{([\w\s-]+)\}\}/g;
    const matches = Array.from(text.matchAll(regex));

    // Extract the capture group (inner text) and remove duplicates
    const variables = matches.map(match => match[1].trim());
    return Array.from(new Set(variables));
}

/**
 * Replaces {{variable}} placeholders with provided values.
 * If a value is missing, keeps the original placeholder.
 */
export function fillVariables(text: string, values: Record<string, string>): string {
    return text.replace(/\{\{([\w\s-]+)\}\}/g, (match, variableName) => {
        const key = variableName.trim();
        // If we have a value, use it. Otherwise keep the {{placeholder}}
        return values[key] !== undefined && values[key] !== '' ? values[key] : match;
    });
}
