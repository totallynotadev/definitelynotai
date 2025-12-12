import { spawn } from 'node:child_process';

export interface ModalWorkflowResult {
  status: 'complete' | 'failed';
  plan?: Record<string, unknown>;
  generatedCode?: Record<string, string>;
  error?: string;
}

export class ModalClient {
  private tokenId: string;
  private tokenSecret: string;

  constructor(tokenId: string, tokenSecret: string) {
    this.tokenId = tokenId;
    this.tokenSecret = tokenSecret;
  }

  /**
   * Trigger a Modal function via CLI
   * In production, you'd use Modal's HTTP endpoints
   */
  async triggerWorkflow(
    projectId: string,
    prompt: string,
    platforms: string[]
  ): Promise<{ runId: string }> {
    // For MVP, we'll call Modal via subprocess
    // In production, deploy Modal with webhook and call via HTTP

    const runId = `run_${Date.now()}`;

    // Spawn Modal run in background
    const child = spawn(
      'modal',
      [
        'run',
        'packages/sandbox/modal/app.py::run_agent_workflow',
        '--project-id',
        projectId,
        '--prompt',
        prompt,
        '--platforms',
        JSON.stringify(platforms),
      ],
      {
        env: {
          ...process.env,
          MODAL_TOKEN_ID: this.tokenId,
          MODAL_TOKEN_SECRET: this.tokenSecret,
        },
        detached: true,
        stdio: 'ignore',
      }
    );

    child.unref();

    return { runId };
  }

  /**
   * For simpler use cases, run synchronously
   */
  async runWorkflowSync(
    projectId: string,
    prompt: string,
    platforms: string[]
  ): Promise<ModalWorkflowResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'modal',
        [
          'run',
          'packages/sandbox/modal/app.py::run_agent_workflow',
          '--project-id',
          projectId,
          '--prompt',
          prompt,
          '--platforms',
          JSON.stringify(platforms),
        ],
        {
          env: {
            ...process.env,
            MODAL_TOKEN_ID: this.tokenId,
            MODAL_TOKEN_SECRET: this.tokenSecret,
          },
        }
      );

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout) as ModalWorkflowResult;
            resolve(result);
          } catch {
            resolve({ status: 'complete', generatedCode: {} });
          }
        } else {
          reject(new Error(`Modal failed: ${stderr}`));
        }
      });
    });
  }

  /**
   * Check if Modal is available and configured
   */
  async healthCheck(): Promise<{ available: boolean; error?: string }> {
    return new Promise((resolve) => {
      const child = spawn('modal', ['--version'], {
        env: {
          ...process.env,
          MODAL_TOKEN_ID: this.tokenId,
          MODAL_TOKEN_SECRET: this.tokenSecret,
        },
      });

      let stderr = '';

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ available: true });
        } else {
          resolve({ available: false, error: stderr || 'Modal CLI not found' });
        }
      });

      child.on('error', (err) => {
        resolve({ available: false, error: err.message });
      });
    });
  }

  /**
   * Deploy the Modal app
   */
  async deploy(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const child = spawn('modal', ['deploy', 'packages/sandbox/modal/app.py'], {
        env: {
          ...process.env,
          MODAL_TOKEN_ID: this.tokenId,
          MODAL_TOKEN_SECRET: this.tokenSecret,
        },
      });

      let stderr = '';

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: stderr });
        }
      });

      child.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }
}
