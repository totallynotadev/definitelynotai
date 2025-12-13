import type { Template, TemplateFile, InjectionPoint, InjectionRequest, Platform } from './types.js';

// Lazy-load Node.js modules to support Cloudflare Workers
// File system operations will throw in non-Node environments
async function getNodeModules() {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const url = await import('node:url');
    return { fs, path, url };
  } catch {
    throw new Error('File system operations require Node.js runtime');
  }
}

async function getTemplatesDir(): Promise<string> {
  // This is used only in Node.js context, so we can use import.meta.url
  try {
    const { path, url } = await getNodeModules();
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '..', 'templates');
  } catch {
    return './templates';
  }
}

// Template registry
const TEMPLATES: Record<string, Template> = {
  'sveltekit-web': {
    id: 'sveltekit-web',
    name: 'SvelteKit Web App',
    description: 'Full-stack web application with SvelteKit, Tailwind, and Drizzle',
    platform: 'web',
    path: 'sveltekit-web',
    injectionPoints: [
      { marker: '@agent:inject:schema', file: 'src/lib/server/db/schema.ts', type: 'append', description: 'Database schema definitions' },
      { marker: '@agent:inject:routes', file: 'src/routes/api/[...path]/+server.ts', type: 'append', description: 'API route handlers' },
      { marker: '@agent:inject:get-routes', file: 'src/routes/api/[...path]/+server.ts', type: 'append', description: 'GET route handlers' },
      { marker: '@agent:inject:post-routes', file: 'src/routes/api/[...path]/+server.ts', type: 'append', description: 'POST route handlers' },
      { marker: '@agent:inject:components', file: 'src/routes/+page.svelte', type: 'append', description: 'Page components' },
      { marker: '@agent:inject:imports', file: 'src/routes/+page.svelte', type: 'append', description: 'Component imports' },
      { marker: '@agent:inject:title', file: 'src/routes/+page.svelte', type: 'replace', description: 'Page title' },
      { marker: '@agent:inject:load', file: 'src/routes/+page.server.ts', type: 'append', description: 'Server load function' },
      { marker: '@agent:inject:data', file: 'src/routes/+page.server.ts', type: 'append', description: 'Page data' },
    ],
    dependencies: {
      '@sveltejs/kit': '^2.0.0',
      'drizzle-orm': '^0.38.0',
      '@neondatabase/serverless': '^0.10.0',
    },
    devDependencies: {
      'tailwindcss': '^3.4.0',
      'typescript': '^5.0.0',
    },
  },
  'expo-mobile': {
    id: 'expo-mobile',
    name: 'Expo Mobile App',
    description: 'React Native mobile app with Expo Router and NativeWind',
    platform: 'mobile',
    path: 'expo-mobile',
    injectionPoints: [
      { marker: '@agent:inject:types', file: 'lib/types.ts', type: 'append', description: 'Type definitions' },
      { marker: '@agent:inject:store-types', file: 'lib/store.ts', type: 'append', description: 'Store type definitions' },
      { marker: '@agent:inject:store-state', file: 'lib/store.ts', type: 'append', description: 'Store state properties' },
      { marker: '@agent:inject:store-initial', file: 'lib/store.ts', type: 'append', description: 'Store initial values' },
      { marker: '@agent:inject:api-types', file: 'lib/api.ts', type: 'append', description: 'API type definitions' },
      { marker: '@agent:inject:api-functions', file: 'lib/api.ts', type: 'append', description: 'API functions' },
      { marker: '@agent:inject:components', file: 'components/index.ts', type: 'append', description: 'Component exports' },
      { marker: '@agent:inject:tabs', file: 'app/(tabs)/_layout.tsx', type: 'append', description: 'Tab screens' },
      { marker: '@agent:inject:imports', file: 'app/index.tsx', type: 'append', description: 'Screen imports' },
    ],
    dependencies: {
      'expo': '~52.0.0',
      'expo-router': '~4.0.0',
      'zustand': '^5.0.0',
      'nativewind': '^4.0.0',
    },
    devDependencies: {
      'tailwindcss': '^3.4.0',
      'typescript': '^5.0.0',
    },
  },
  'hono-backend': {
    id: 'hono-backend',
    name: 'Hono API Backend',
    description: 'API server with Hono, Drizzle, and Cloudflare Workers',
    platform: 'api',
    path: 'hono-backend',
    injectionPoints: [
      { marker: '@agent:inject:schema', file: 'src/db/schema.ts', type: 'append', description: 'Database schema' },
      { marker: '@agent:inject:routes', file: 'src/routes/index.ts', type: 'append', description: 'API routes' },
      { marker: '@agent:inject:imports', file: 'src/routes/index.ts', type: 'append', description: 'Route imports' },
      { marker: '@agent:inject:types', file: 'src/types/index.ts', type: 'append', description: 'Type definitions' },
      { marker: '@agent:inject:env-types', file: 'src/types/index.ts', type: 'append', description: 'Environment types' },
      { marker: '@agent:inject:env-schema', file: 'src/lib/env.ts', type: 'append', description: 'Environment validation' },
      { marker: '@agent:inject:variables', file: 'src/types/index.ts', type: 'append', description: 'Request variables' },
    ],
    dependencies: {
      'hono': '^4.0.0',
      'drizzle-orm': '^0.38.0',
      '@neondatabase/serverless': '^0.10.0',
      '@clerk/backend': '^1.0.0',
      'zod': '^3.22.0',
    },
    devDependencies: {
      'wrangler': '^3.0.0',
      'typescript': '^5.0.0',
    },
  },
};

export class TemplateManager {
  private templatesDir: string | undefined;

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir ?? undefined;
  }

  private async getTemplatesPath(): Promise<string> {
    if (this.templatesDir !== undefined) return this.templatesDir;
    return getTemplatesDir();
  }

  /**
   * Get a template by ID
   */
  getTemplate(id: string): Template | undefined {
    return TEMPLATES[id];
  }

  /**
   * Get template for a platform
   */
  getTemplateForPlatform(platform: Platform): Template | undefined {
    const mapping: Record<Platform, string> = {
      web: 'sveltekit-web',
      mobile: 'expo-mobile',
      api: 'hono-backend',
    };
    return TEMPLATES[mapping[platform]];
  }

  /**
   * List all available templates
   */
  listTemplates(): Template[] {
    return Object.values(TEMPLATES);
  }

  /**
   * Read all files from a template
   * Note: This method requires Node.js runtime (not available in Cloudflare Workers)
   */
  async readTemplateFiles(templateId: string): Promise<TemplateFile[]> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const { path } = await getNodeModules();
    const templatesDir = await this.getTemplatesPath();
    const templatePath = path.join(templatesDir, template.path);
    return this.readDirRecursive(templatePath, templatePath);
  }

  /**
   * Read directory recursively
   */
  private async readDirRecursive(dir: string, basePath: string): Promise<TemplateFile[]> {
    const { fs, path } = await getNodeModules();
    const files: TemplateFile[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

      // Skip node_modules, .git, and other build artifacts
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.svelte-kit') {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await this.readDirRecursive(fullPath, basePath);
        files.push(...subFiles);
      } else {
        const content = await fs.readFile(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      }
    }

    return files;
  }

  /**
   * Find injection points in template files
   */
  findInjectionPoints(files: TemplateFile[]): InjectionPoint[] {
    const points: InjectionPoint[] = [];
    const markerRegex = /\/\/\s*@agent:inject:(\w+[-\w]*)/g;

    for (const file of files) {
      let match;
      while ((match = markerRegex.exec(file.content)) !== null) {
        points.push({
          marker: `@agent:inject:${match[1]}`,
          file: file.path,
          type: 'append',
          description: `Injection point: ${match[1]}`,
        });
      }
    }

    return points;
  }

  /**
   * Inject code at markers in template files
   */
  injectCode(files: TemplateFile[], injections: InjectionRequest[]): TemplateFile[] {
    return files.map(file => {
      let content = file.content;

      for (const injection of injections) {
        // Escape special regex characters in the marker
        const escapedMarker = injection.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const markerRegex = new RegExp(
          `(\\/\\/\\s*${escapedMarker})`,
          'g'
        );

        // Replace marker with injected code (keeping marker as comment)
        content = content.replace(markerRegex, `$1\n${injection.content}`);
      }

      return { ...file, content };
    });
  }

  /**
   * Prepare template for a project
   * Returns files ready to be written to sandbox
   */
  async prepareTemplate(
    templateId: string,
    injections: InjectionRequest[],
    customizations?: {
      appName?: string;
      description?: string;
    }
  ): Promise<Record<string, string>> {
    // Read template files
    const files = await this.readTemplateFiles(templateId);

    // Apply injections
    const injectedFiles = this.injectCode(files, injections);

    // Apply customizations
    const customizedFiles = injectedFiles.map(file => {
      let content = file.content;

      if (customizations?.appName) {
        content = content.replace(/{{APP_NAME}}/g, customizations.appName);
        content = content.replace(/Generated App/g, customizations.appName);
        // Update package.json name field
        if (file.path === 'package.json') {
          const safeName = customizations.appName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          content = content.replace(/"name":\s*"[^"]*"/, `"name": "${safeName}"`);
        }
      }

      if (customizations?.description) {
        content = content.replace(/{{APP_DESCRIPTION}}/g, customizations.description);
      }

      return { ...file, content };
    });

    // Convert to Record<path, content> for sandbox
    return Object.fromEntries(
      customizedFiles.map(f => [f.path, f.content])
    );
  }

  /**
   * Get injection points for a template
   */
  getInjectionPoints(templateId: string): InjectionPoint[] {
    const template = this.getTemplate(templateId);
    return template?.injectionPoints ?? [];
  }

  /**
   * Get template dependencies
   */
  getTemplateDependencies(templateId: string): {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } {
    const template = this.getTemplate(templateId);
    return {
      dependencies: template?.dependencies ?? {},
      devDependencies: template?.devDependencies ?? {},
    };
  }
}

// Export singleton for convenience
export const templateManager = new TemplateManager();

// Export template registry for direct access
export { TEMPLATES };
