import { Sandbox } from '@e2b/code-interpreter';
import type { SandboxConfig, CommandResult, ExecutionResult } from './types.js';

export class SandboxManager {
  private sandboxes: Map<string, Sandbox> = new Map();
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Create a new sandbox for a project
   * @param projectId - Unique project identifier
   * @param config - Sandbox configuration
   */
  async createSandbox(projectId: string, config?: SandboxConfig): Promise<Sandbox> {
    // Use the code-interpreter template (has Node, Python, etc.)
    const sandbox = await Sandbox.create({
      apiKey: this.apiKey,
      timeoutMs: config?.timeout || 300000, // 5 minutes default
    });

    this.sandboxes.set(projectId, sandbox);
    return sandbox;
  }

  /**
   * Get an existing sandbox
   */
  getSandbox(projectId: string): Sandbox | undefined {
    return this.sandboxes.get(projectId);
  }

  /**
   * Write files to the sandbox
   */
  async writeFiles(projectId: string, files: Record<string, string>): Promise<void> {
    const sandbox = this.sandboxes.get(projectId);
    if (!sandbox) throw new Error(`Sandbox not found: ${projectId}`);

    for (const [path, content] of Object.entries(files)) {
      await sandbox.files.write(path, content);
    }
  }

  /**
   * Read a file from the sandbox
   */
  async readFile(projectId: string, path: string): Promise<string> {
    const sandbox = this.sandboxes.get(projectId);
    if (!sandbox) throw new Error(`Sandbox not found: ${projectId}`);

    return await sandbox.files.read(path);
  }

  /**
   * Run a command in the sandbox
   */
  async runCommand(projectId: string, command: string): Promise<CommandResult> {
    const sandbox = this.sandboxes.get(projectId);
    if (!sandbox) throw new Error(`Sandbox not found: ${projectId}`);

    const startTime = Date.now();
    const result = await sandbox.commands.run(command, {
      timeoutMs: 60000, // 1 minute per command
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Execute code directly (for quick tests)
   * Note: E2B code-interpreter runs Python by default.
   * For JS/TS, use runCommand with node instead.
   */
  async executeCode(
    projectId: string,
    code: string,
    language: 'javascript' | 'typescript' | 'python' = 'python'
  ): Promise<ExecutionResult> {
    const sandbox = this.sandboxes.get(projectId);
    if (!sandbox) throw new Error(`Sandbox not found: ${projectId}`);

    // For JavaScript/TypeScript, use node command instead of runCode
    if (language === 'javascript' || language === 'typescript') {
      const cmd = language === 'typescript' ? `npx ts-node -e "${code.replace(/"/g, '\\"')}"` : `node -e "${code.replace(/"/g, '\\"')}"`;
      const result = await this.runCommand(projectId, cmd);
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        error: result.exitCode !== 0 ? result.stderr : null,
      };
    }

    // For Python, use the native runCode
    const execution = await sandbox.runCode(code);

    // Combine logs and result text for complete output
    const stdout = execution.logs.stdout.join('\n');
    const resultText = execution.text ?? '';
    const combinedOutput = [stdout, resultText].filter(Boolean).join('\n');

    return {
      stdout: combinedOutput,
      stderr: execution.logs.stderr.join('\n'),
      exitCode: execution.error ? 1 : 0,
      error: execution.error ? `${execution.error.name}: ${execution.error.value}` : null,
    };
  }

  /**
   * Get the sandbox URL for preview (if running a dev server)
   */
  getPreviewUrl(projectId: string, port: number = 3000): string {
    const sandbox = this.sandboxes.get(projectId);
    if (!sandbox) throw new Error(`Sandbox not found: ${projectId}`);

    return sandbox.getHost(port);
  }

  /**
   * Destroy a sandbox and clean up resources
   */
  async destroySandbox(projectId: string): Promise<void> {
    const sandbox = this.sandboxes.get(projectId);
    if (sandbox) {
      await sandbox.kill();
      this.sandboxes.delete(projectId);
    }
  }

  /**
   * Destroy all sandboxes (cleanup on shutdown)
   */
  async destroyAll(): Promise<void> {
    for (const [projectId] of this.sandboxes) {
      await this.destroySandbox(projectId);
    }
  }
}
