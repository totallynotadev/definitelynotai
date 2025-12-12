import { SandboxManager } from './manager.js';
import type { SandboxConfig } from './types.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  buildOutput?: string | undefined;
  previewUrl?: string | undefined;
}

export interface ValidationError {
  type: 'typescript' | 'lint' | 'build' | 'runtime';
  message: string;
  file?: string | undefined;
  line?: number | undefined;
}

export class CodeValidator {
  private manager: SandboxManager;

  constructor(manager: SandboxManager) {
    this.manager = manager;
  }

  /**
   * Validate generated code in a sandbox
   */
  async validateProject(
    projectId: string,
    files: Record<string, string>,
    options: {
      installDeps?: boolean;
      runTypeCheck?: boolean;
      runLint?: boolean;
      runBuild?: boolean;
      startDevServer?: boolean;
    } = {}
  ): Promise<ValidationResult> {
    const {
      installDeps = true,
      runTypeCheck = true,
      runLint = true,
      runBuild = true,
      startDevServer = false,
    } = options;

    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // 1. Create sandbox
      const config: SandboxConfig = {
        timeout: 600000, // 10 min
        template: 'code-interpreter',
        envVars: {},
      };
      await this.manager.createSandbox(projectId, config);

      // 2. Write all files
      await this.manager.writeFiles(projectId, files);

      // 3. Install dependencies
      if (installDeps && files['package.json']) {
        const installResult = await this.manager.runCommand(projectId, 'npm install');
        if (installResult.exitCode !== 0) {
          errors.push({
            type: 'build',
            message: `Dependency installation failed: ${installResult.stderr}`,
          });
          return { valid: false, errors, warnings };
        }
      }

      // 4. TypeScript check
      if (runTypeCheck && (files['tsconfig.json'] || this.hasTypeScriptFiles(files))) {
        const tscResult = await this.manager.runCommand(projectId, 'npx tsc --noEmit');
        if (tscResult.exitCode !== 0) {
          const tsErrors = this.parseTypeScriptErrors(tscResult.stderr || tscResult.stdout);
          errors.push(...tsErrors);
        }
      }

      // 5. Lint check
      const hasEslintConfig =
        files['.eslintrc.js'] || files['.eslintrc.cjs'] || files['eslint.config.js'];
      if (runLint && hasEslintConfig) {
        const lintResult = await this.manager.runCommand(
          projectId,
          'npx eslint . --ext .ts,.tsx,.js,.jsx'
        );
        if (lintResult.exitCode !== 0) {
          // Lint errors are warnings, not blockers
          warnings.push(`Lint issues: ${lintResult.stdout}`);
        }
      }

      // 6. Build
      let buildOutput: string | undefined;
      if (runBuild) {
        const buildResult = await this.manager.runCommand(projectId, 'npm run build');
        if (buildResult.exitCode !== 0) {
          errors.push({
            type: 'build',
            message: `Build failed: ${buildResult.stderr || buildResult.stdout}`,
          });
          return { valid: false, errors, warnings, buildOutput: buildResult.stdout };
        }
        buildOutput = buildResult.stdout;
      }

      // 7. Start dev server (optional, for preview)
      let previewUrl: string | undefined;
      if (startDevServer) {
        // Start in background
        await this.manager.runCommand(projectId, 'npm run dev &');
        // Wait a bit for server to start
        await new Promise((resolve) => setTimeout(resolve, 5000));
        previewUrl = this.manager.getPreviewUrl(projectId, 3000);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        buildOutput,
        previewUrl,
      };
    } catch (error) {
      errors.push({
        type: 'runtime',
        message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
      });
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Quick validation - just TypeScript check
   */
  async quickValidate(
    projectId: string,
    files: Record<string, string>
  ): Promise<ValidationResult> {
    return this.validateProject(projectId, files, {
      installDeps: true,
      runTypeCheck: true,
      runLint: false,
      runBuild: false,
      startDevServer: false,
    });
  }

  /**
   * Full validation with build
   */
  async fullValidate(
    projectId: string,
    files: Record<string, string>
  ): Promise<ValidationResult> {
    return this.validateProject(projectId, files, {
      installDeps: true,
      runTypeCheck: true,
      runLint: true,
      runBuild: true,
      startDevServer: false,
    });
  }

  private hasTypeScriptFiles(files: Record<string, string>): boolean {
    return Object.keys(files).some((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
  }

  private parseTypeScriptErrors(output: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Format 1 (old): src/file.ts(10,5): error TS2322: Type 'string' is not assignable...
      const matchOld = line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (matchOld && matchOld[1] && matchOld[2] && matchOld[4] && matchOld[5]) {
        errors.push({
          type: 'typescript',
          file: matchOld[1],
          line: parseInt(matchOld[2], 10),
          message: `${matchOld[4]}: ${matchOld[5]}`,
        });
        continue;
      }

      // Format 2 (new): index.ts:1:7 - error TS2322: Type 'string' is not assignable...
      const matchNew = line.match(/^(.+):(\d+):(\d+) - error (TS\d+): (.+)$/);
      if (matchNew && matchNew[1] && matchNew[2] && matchNew[4] && matchNew[5]) {
        errors.push({
          type: 'typescript',
          file: matchNew[1],
          line: parseInt(matchNew[2], 10),
          message: `${matchNew[4]}: ${matchNew[5]}`,
        });
        continue;
      }

      // Format 3: error TS2322: Type 'string' is not assignable... (no file info)
      const matchNoFile = line.match(/^error (TS\d+): (.+)$/);
      if (matchNoFile && matchNoFile[1] && matchNoFile[2]) {
        errors.push({
          type: 'typescript',
          message: `${matchNoFile[1]}: ${matchNoFile[2]}`,
        });
        continue;
      }
    }

    // If no structured errors found but output contains "error TS", it's still a TS error
    if (errors.length === 0 && output.trim()) {
      const isTypeScriptError = /error TS\d+/i.test(output);
      errors.push({
        type: isTypeScriptError ? 'typescript' : 'runtime',
        message: output.trim(),
      });
    }

    return errors;
  }

  /**
   * Cleanup after validation
   */
  async cleanup(projectId: string): Promise<void> {
    await this.manager.destroySandbox(projectId);
  }
}
