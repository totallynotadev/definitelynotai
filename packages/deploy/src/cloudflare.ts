import type { CloudflareProjectConfig, DeploymentResult } from './types';

interface CloudflareAPIResponse<T> {
  success: boolean;
  errors: Array<{ message: string }>;
  result: T;
}

export class CloudflareClient {
  private apiToken: string;
  private accountId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(apiToken: string, accountId: string) {
    this.apiToken = apiToken;
    this.accountId = accountId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data: CloudflareAPIResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.errors.map(e => e.message).join(', '));
    }

    return data.result;
  }

  /**
   * Create a new Pages project
   */
  async createPagesProject(config: CloudflareProjectConfig): Promise<{
    name: string;
    subdomain: string;
    domains: string[];
  }> {
    const result = await this.request<{
      name: string;
      subdomain: string;
      domains?: string[];
    }>(
      `/accounts/${this.accountId}/pages/projects`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: config.name,
          production_branch: config.productionBranch || 'main',
          build_config: {
            build_command: config.buildCommand || 'npm run build',
            destination_dir: config.buildOutputDirectory || 'build',
          },
        }),
      }
    );

    return {
      name: result.name,
      subdomain: result.subdomain,
      domains: result.domains || [`${result.subdomain}.pages.dev`],
    };
  }

  /**
   * Check if Pages project exists
   */
  async pagesProjectExists(name: string): Promise<boolean> {
    try {
      await this.request(`/accounts/${this.accountId}/pages/projects/${name}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deploy to Pages (direct upload)
   */
  async deployToPages(
    projectName: string,
    files: Record<string, string>,
    _branch: string = 'main'
  ): Promise<DeploymentResult> {
    const startTime = Date.now();

    try {
      // Create form data with files
      const formData = new FormData();
      for (const [path, content] of Object.entries(files)) {
        const blob = new Blob([content], { type: 'application/octet-stream' });
        formData.append(path, blob, path);
      }

      // Create deployment
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.accountId}/pages/projects/${projectName}/deployments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          platform: 'cloudflare-pages',
          error: data.errors.map((e: { message: string }) => e.message).join(', '),
          duration: Date.now() - startTime,
        };
      }

      return {
        success: true,
        platform: 'cloudflare-pages',
        url: data.result.url,
        buildId: data.result.id,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'cloudflare-pages',
        error: error instanceof Error ? error.message : 'Deployment failed',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Set environment variables for Pages project
   */
  async setPagesEnvironmentVariables(
    projectName: string,
    variables: Record<string, string>,
    environment: 'preview' | 'production' = 'production'
  ): Promise<void> {
    await this.request(
      `/accounts/${this.accountId}/pages/projects/${projectName}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          deployment_configs: {
            [environment]: {
              env_vars: Object.fromEntries(
                Object.entries(variables).map(([key, value]) => [
                  key,
                  { type: 'plain_text', value },
                ])
              ),
            },
          },
        }),
      }
    );
  }

  /**
   * Create a Workers project
   */
  async deployWorker(
    name: string,
    script: string,
    bindings?: {
      vars?: Record<string, string>;
      kv?: Array<{ binding: string; id: string }>;
      d1?: Array<{ binding: string; id: string }>;
    }
  ): Promise<DeploymentResult> {
    const startTime = Date.now();

    try {
      // Deploy worker script
      const formData = new FormData();
      const metadata = {
        main_module: 'index.js',
        bindings: [
          ...(bindings?.vars
            ? Object.entries(bindings.vars).map(([name, text]) => ({
                type: 'plain_text',
                name,
                text,
              }))
            : []),
          ...(bindings?.kv?.map(kv => ({
            type: 'kv_namespace',
            name: kv.binding,
            namespace_id: kv.id,
          })) || []),
          ...(bindings?.d1?.map(d1 => ({
            type: 'd1',
            name: d1.binding,
            id: d1.id,
          })) || []),
        ],
      };

      formData.append('metadata', JSON.stringify(metadata));
      formData.append('index.js', new Blob([script], { type: 'application/javascript' }), 'index.js');

      const response = await fetch(
        `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${name}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          platform: 'cloudflare-workers',
          error: data.errors.map((e: { message: string }) => e.message).join(', '),
          duration: Date.now() - startTime,
        };
      }

      // Enable worker on workers.dev subdomain
      await this.request(
        `/accounts/${this.accountId}/workers/scripts/${name}/subdomain`,
        {
          method: 'POST',
          body: JSON.stringify({ enabled: true }),
        }
      );

      return {
        success: true,
        platform: 'cloudflare-workers',
        url: `https://${name}.${this.accountId.slice(0, 8)}.workers.dev`,
        buildId: data.result.id,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'cloudflare-workers',
        error: error instanceof Error ? error.message : 'Worker deployment failed',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(projectName: string, deploymentId: string): Promise<{
    status: string;
    url: string;
  }> {
    const result = await this.request<{
      latest_stage?: { status: string };
      url: string;
    }>(
      `/accounts/${this.accountId}/pages/projects/${projectName}/deployments/${deploymentId}`
    );

    return {
      status: result.latest_stage?.status || 'queued',
      url: result.url,
    };
  }

  /**
   * List all Pages projects
   */
  async listPagesProjects(): Promise<Array<{ name: string; subdomain: string }>> {
    const result = await this.request<Array<{ name: string; subdomain: string }>>(
      `/accounts/${this.accountId}/pages/projects`
    );

    return result.map(p => ({
      name: p.name,
      subdomain: p.subdomain,
    }));
  }
}
