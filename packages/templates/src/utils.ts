import type { InjectionPoint, InjectionRequest, TemplateFile } from './types.js';

/**
 * Find all injection point markers in file content
 */
export function findInjectionMarkers(content: string): string[] {
  const markerRegex = /\/\/\s*@agent:inject:(\w+)/g;
  const markers: string[] = [];
  let match;

  while ((match = markerRegex.exec(content)) !== null) {
    markers.push(`@agent:inject:${match[1]}`);
  }

  return markers;
}

/**
 * Apply an injection to file content based on the injection point type
 */
export function applyInjection(
  content: string,
  injectionPoint: InjectionPoint,
  injection: InjectionRequest
): string {
  const markerPattern = `// ${injectionPoint.marker}`;

  if (!content.includes(markerPattern)) {
    throw new Error(`Marker "${injectionPoint.marker}" not found in file`);
  }

  switch (injectionPoint.type) {
    case 'replace':
      return content.replace(markerPattern, injection.content);

    case 'append':
      return content.replace(
        markerPattern,
        `${markerPattern}\n${injection.content}`
      );

    case 'prepend':
      return content.replace(
        markerPattern,
        `${injection.content}\n${markerPattern}`
      );

    default:
      throw new Error(`Unknown injection type: ${injectionPoint.type}`);
  }
}

/**
 * Apply multiple injections to a set of template files
 */
export function applyInjections(
  files: TemplateFile[],
  injectionPoints: InjectionPoint[],
  injections: InjectionRequest[]
): TemplateFile[] {
  return files.map(file => {
    let { content } = file;

    for (const injection of injections) {
      const point = injectionPoints.find(p =>
        p.marker === injection.marker && p.file === file.path
      );

      if (point) {
        content = applyInjection(content, point, injection);
      }
    }

    return { ...file, content };
  });
}

/**
 * Merge dependencies from template and generated code
 */
export function mergeDependencies(
  templateDeps: Record<string, string>,
  generatedDeps: Record<string, string>
): Record<string, string> {
  return { ...templateDeps, ...generatedDeps };
}

/**
 * Normalize a file path to use forward slashes
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Check if a path is within a directory
 */
export function isPathWithin(filePath: string, directory: string): boolean {
  const normalizedFile = normalizePath(filePath);
  const normalizedDir = normalizePath(directory);
  return normalizedFile.startsWith(normalizedDir);
}
