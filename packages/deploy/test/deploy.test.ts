import { describe, it, expect } from 'vitest';
import { GitHubClient, DeploymentOrchestrator } from '../src';

// Mock tests (don't actually call APIs)

describe('GitHubClient', () => {
  it('should sanitize repository names', () => {
    const orchestrator = new DeploymentOrchestrator({
      github: { token: 'fake-token' },
      cloudflare: { apiToken: 'fake-token', accountId: 'fake-id' },
    });

    // Access private method via any cast for testing
    const sanitize = (orchestrator as unknown as { sanitizeRepoName: (name: string) => string }).sanitizeRepoName.bind(orchestrator);

    expect(sanitize('My App Name')).toBe('my-app-name');
    expect(sanitize('app--name')).toBe('app-name');
    expect(sanitize('App_With_Underscores')).toBe('app-with-underscores');
  });
});

describe('DeploymentOrchestrator', () => {
  it('should create orchestrator with config', () => {
    const orchestrator = new DeploymentOrchestrator({
      github: { token: 'fake-token' },
      cloudflare: { apiToken: 'fake-token', accountId: 'fake-id' },
    });

    expect(orchestrator).toBeDefined();
  });

  it('should handle missing EAS config gracefully', () => {
    const orchestrator = new DeploymentOrchestrator({
      github: { token: 'fake-token' },
      cloudflare: { apiToken: 'fake-token', accountId: 'fake-id' },
      // No EAS config
    });

    expect(orchestrator).toBeDefined();
  });
});

describe('GitHub Workflow Generation', () => {
  it('should generate Pages workflow', () => {
    const client = new GitHubClient('fake-token');

    // Test workflow generation (access via any)
    const workflow = (client as unknown as { generateWorkflow: (type: string, config: { outputDir?: string }) => string }).generateWorkflow('pages', { outputDir: 'build' });

    expect(workflow).toContain('Cloudflare Pages');
    expect(workflow).toContain('cloudflare/pages-action');
    expect(workflow).toContain('directory: build');
  });

  it('should generate Workers workflow', () => {
    const client = new GitHubClient('fake-token');

    const workflow = (client as unknown as { generateWorkflow: (type: string, config: Record<string, unknown>) => string }).generateWorkflow('workers', {});

    expect(workflow).toContain('Cloudflare Workers');
    expect(workflow).toContain('wrangler-action');
  });
});
