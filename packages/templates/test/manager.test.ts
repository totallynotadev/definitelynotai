import { describe, it, expect, beforeAll } from 'vitest';
import { TemplateManager, TEMPLATE_IDS } from '../src';

describe('TemplateManager', () => {
  let manager: TemplateManager;

  beforeAll(() => {
    manager = new TemplateManager();
  });

  it('should list all templates', () => {
    const templates = manager.listTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(3);
    expect(templates.map(t => t.id)).toContain('sveltekit-web');
  });

  it('should get template by ID', () => {
    const template = manager.getTemplate('sveltekit-web');
    expect(template).toBeDefined();
    expect(template?.name).toBe('SvelteKit Web App');
    expect(template?.platform).toBe('web');
  });

  it('should get template for platform', () => {
    const webTemplate = manager.getTemplateForPlatform('web');
    expect(webTemplate?.id).toBe('sveltekit-web');

    const mobileTemplate = manager.getTemplateForPlatform('mobile');
    expect(mobileTemplate?.id).toBe('expo-mobile');

    const apiTemplate = manager.getTemplateForPlatform('api');
    expect(apiTemplate?.id).toBe('hono-backend');
  });

  it('should read template files', async () => {
    const files = await manager.readTemplateFiles('sveltekit-web');
    expect(files.length).toBeGreaterThan(0);
    const hasPackageJson = files.some(f => f.path === 'package.json');
    expect(hasPackageJson).toBe(true);
  });

  it('should find injection points', async () => {
    const files = await manager.readTemplateFiles('sveltekit-web');
    const points = manager.findInjectionPoints(files);
    expect(points.length).toBeGreaterThan(0);
    expect(points.some(p => p.marker.includes('schema'))).toBe(true);
  });

  it('should inject code at markers', async () => {
    const files = await manager.readTemplateFiles('hono-backend');
    const injected = manager.injectCode(files, [
      {
        marker: '@agent:inject:schema',
        content: 'export const todos = pgTable("todos", { id: text("id") });',
      },
    ]);
    const schemaFile = injected.find(f => f.path.includes('schema'));
    expect(schemaFile?.content).toContain('todos = pgTable');
  });

  it('should prepare template with injections', async () => {
    const files = await manager.prepareTemplate(
      'hono-backend',
      [{ marker: '@agent:inject:schema', content: '// injected schema' }],
      { appName: 'My Test App' }
    );
    expect(Object.keys(files).length).toBeGreaterThan(0);
    const packageJson = files['package.json'];
    expect(packageJson).toContain('my-test-app');
  });
});
