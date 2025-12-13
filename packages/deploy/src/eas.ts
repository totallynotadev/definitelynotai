import { spawn } from 'child_process';
import type { EASBuildConfig, DeploymentResult } from './types';

export class EASClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Trigger EAS build
   */
  async triggerBuild(
    projectDir: string,
    config: EASBuildConfig
  ): Promise<DeploymentResult> {
    const startTime = Date.now();
    const args = [
      'build',
      '--platform', config.platform,
      '--profile', config.profile,
      '--non-interactive',
      '--json',
    ];

    if (config.autoSubmit) {
      args.push('--auto-submit');
    }

    try {
      const result = await this.runEASCommand(projectDir, args);
      const buildInfo = JSON.parse(result.stdout);

      const deploymentResult: DeploymentResult = {
        success: true,
        platform: 'eas',
        buildId: buildInfo[0]?.id,
        url: buildInfo[0]?.buildDetailsPageUrl,
        duration: Date.now() - startTime,
      };

      if (result.stderr) {
        deploymentResult.logs = [result.stderr];
      }

      return deploymentResult;
    } catch (error) {
      return {
        success: false,
        platform: 'eas',
        error: error instanceof Error ? error.message : 'EAS build failed',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get build status
   */
  async getBuildStatus(buildId: string): Promise<{
    status: string;
    artifacts?: { buildUrl?: string; applicationArchiveUrl?: string };
  }> {
    const result = await this.runEASCommand('.', [
      'build:view',
      buildId,
      '--json',
    ]);

    const buildInfo = JSON.parse(result.stdout);

    return {
      status: buildInfo.status,
      artifacts: buildInfo.artifacts,
    };
  }

  /**
   * Submit to app stores
   */
  async submitToStore(
    projectDir: string,
    platform: 'ios' | 'android',
    buildId?: string
  ): Promise<DeploymentResult> {
    const startTime = Date.now();
    const args = [
      'submit',
      '--platform', platform,
      '--non-interactive',
      '--json',
    ];

    if (buildId) {
      args.push('--id', buildId);
    } else {
      args.push('--latest');
    }

    try {
      const result = await this.runEASCommand(projectDir, args);
      const submitInfo = JSON.parse(result.stdout);

      return {
        success: true,
        platform: 'eas',
        buildId: submitInfo.id,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'eas',
        error: error instanceof Error ? error.message : 'Store submission failed',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Update OTA (over-the-air)
   */
  async publishUpdate(
    projectDir: string,
    channel: string = 'production',
    message?: string
  ): Promise<DeploymentResult> {
    const startTime = Date.now();
    const args = [
      'update',
      '--channel', channel,
      '--non-interactive',
      '--json',
    ];

    if (message) {
      args.push('--message', message);
    }

    try {
      const result = await this.runEASCommand(projectDir, args);
      const updateInfo = JSON.parse(result.stdout);

      return {
        success: true,
        platform: 'eas',
        buildId: updateInfo.id,
        url: updateInfo.url,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'eas',
        error: error instanceof Error ? error.message : 'OTA update failed',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Configure project for EAS
   */
  async configureProject(projectDir: string): Promise<void> {
    await this.runEASCommand(projectDir, ['build:configure', '--platform', 'all']);
  }

  /**
   * Run EAS CLI command
   */
  private runEASCommand(
    cwd: string,
    args: string[]
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn('eas', args, {
        cwd,
        env: {
          ...process.env,
          EXPO_TOKEN: this.token,
        },
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => { stdout += data; });
      child.stderr?.on('data', (data) => { stderr += data; });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`EAS command failed: ${stderr || stdout}`));
        }
      });

      child.on('error', reject);
    });
  }
}

/**
 * Generate eas.json configuration
 */
export function generateEASConfig(_projectName: string): string {
  return JSON.stringify({
    cli: { version: '>= 5.0.0' },
    build: {
      development: {
        developmentClient: true,
        distribution: 'internal',
        ios: { simulator: true },
      },
      preview: {
        distribution: 'internal',
        ios: { simulator: false },
        android: { buildType: 'apk' },
      },
      production: {
        ios: { autoIncrement: true },
        android: { autoIncrement: true },
      },
    },
    submit: {
      production: {
        ios: { appleId: '{{APPLE_ID}}', ascAppId: '{{ASC_APP_ID}}' },
        android: { track: 'production' },
      },
    },
  }, null, 2);
}
