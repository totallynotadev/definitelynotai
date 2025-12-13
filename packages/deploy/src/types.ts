export type DeploymentPlatform = 'cloudflare-pages' | 'cloudflare-workers' | 'eas';

export interface DeploymentConfig {
  projectId: string;
  projectName: string;
  platform: DeploymentPlatform;
  repository?: {
    owner: string;
    name: string;
    branch: string;
  };
  environment: 'preview' | 'production';
  secrets?: Record<string, string>;
}

export interface DeploymentResult {
  success: boolean;
  platform: DeploymentPlatform;
  url?: string;
  buildId?: string;
  error?: string;
  logs?: string[];
  duration?: number;
}

export interface GitHubRepoConfig {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
}

export interface CloudflareProjectConfig {
  name: string;
  productionBranch: string;
  buildCommand?: string;
  buildOutputDirectory?: string;
  environmentVariables?: Record<string, string>;
}

export interface EASBuildConfig {
  platform: 'ios' | 'android' | 'all';
  profile: 'development' | 'preview' | 'production';
  autoSubmit?: boolean;
}
