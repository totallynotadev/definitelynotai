import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { SandboxManager, CodeValidator } from '../src';

// Increase timeout for E2B operations (sandbox creation, npm install, etc.)
const SANDBOX_TIMEOUT = 120_000; // 2 minutes

describe('SandboxManager', () => {
  let manager: SandboxManager;
  const testProjectId = 'test-project-' + Date.now();

  beforeAll(() => {
    const apiKey = process.env.E2B_API_KEY;
    if (!apiKey) throw new Error('E2B_API_KEY not set');
    manager = new SandboxManager(apiKey);
  });

  afterAll(async () => {
    await manager.destroyAll();
  });

  it('should create a sandbox', async () => {
    const sandbox = await manager.createSandbox(testProjectId);
    expect(sandbox).toBeDefined();
  }, SANDBOX_TIMEOUT);

  it('should write and read files', async () => {
    await manager.writeFiles(testProjectId, {
      'test.txt': 'Hello, E2B!',
    });

    const content = await manager.readFile(testProjectId, 'test.txt');
    expect(content).toBe('Hello, E2B!');
  }, SANDBOX_TIMEOUT);

  it('should run commands', async () => {
    const result = await manager.runCommand(testProjectId, 'echo "Hello World"');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Hello World');
  }, SANDBOX_TIMEOUT);

  it('should execute Python code', async () => {
    // E2B code-interpreter natively supports Python
    const result = await manager.executeCode(testProjectId, 'print(2 + 2)', 'python');
    expect(result.stdout).toContain('4');
    expect(result.exitCode).toBe(0);
  }, SANDBOX_TIMEOUT);

  it('should execute JavaScript code via node', async () => {
    // JavaScript runs via node command
    const result = await manager.executeCode(testProjectId, 'console.log(2 + 2)', 'javascript');
    expect(result.stdout).toContain('4');
    expect(result.exitCode).toBe(0);
  }, SANDBOX_TIMEOUT);
});

describe('CodeValidator', () => {
  let manager: SandboxManager;
  let validator: CodeValidator;
  const testProjectId = 'validator-test-' + Date.now();

  beforeAll(() => {
    const apiKey = process.env.E2B_API_KEY;
    if (!apiKey) throw new Error('E2B_API_KEY not set');
    manager = new SandboxManager(apiKey);
    validator = new CodeValidator(manager);
  });

  afterAll(async () => {
    await manager.destroyAll();
  });

  it('should validate valid TypeScript', async () => {
    const files = {
      'package.json': JSON.stringify({
        name: 'test',
        type: 'module',
        scripts: { build: 'tsc' },
        devDependencies: { typescript: '^5.0.0' },
      }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          strict: true,
          noEmit: true,
        },
      }),
      'index.ts': 'const x: number = 42; console.log(x);',
    };

    const result = await validator.quickValidate(testProjectId, files);
    await validator.cleanup(testProjectId);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  }, SANDBOX_TIMEOUT);

  it('should catch TypeScript errors', async () => {
    const invalidProjectId = testProjectId + '-invalid';
    const files = {
      'package.json': JSON.stringify({
        name: 'test',
        type: 'module',
        scripts: { build: 'tsc' },
        devDependencies: { typescript: '^5.0.0' },
      }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: { strict: true, noEmit: true },
      }),
      'index.ts': 'const x: number = "not a number";', // Type error!
    };

    const result = await validator.quickValidate(invalidProjectId, files);
    await validator.cleanup(invalidProjectId);

    // The important thing is that invalid code is caught
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toBeDefined();
    // Error type can be 'typescript' or 'runtime' depending on how tsc output is parsed
    expect(['typescript', 'runtime', 'build']).toContain(result.errors[0].type);
  }, SANDBOX_TIMEOUT);
});
