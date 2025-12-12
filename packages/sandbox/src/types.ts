/**
 * Configuration for creating a sandbox instance
 */
export type SandboxConfig = {
  /** Timeout in milliseconds for sandbox operations */
  timeout: number;
  /** E2B template to use for the sandbox */
  template: string;
  /** Environment variables to set in the sandbox */
  envVars: Record<string, string>;
};

/**
 * Result of code execution in the sandbox
 */
export type ExecutionResult = {
  /** Standard output from the execution */
  stdout: string;
  /** Standard error from the execution */
  stderr: string;
  /** Exit code of the execution (0 = success) */
  exitCode: number;
  /** Error message if execution failed */
  error: string | null;
};

/**
 * File operation types
 */
export type FileOperationType = 'write' | 'read' | 'delete';

/**
 * File operation to perform in the sandbox
 */
export type FileOperation = {
  /** Path to the file in the sandbox */
  path: string;
  /** Content for write operations, empty for read/delete */
  content: string;
  /** Type of file operation */
  operation: FileOperationType;
};

/**
 * Result of a command execution in the sandbox
 */
export type CommandResult = {
  /** Standard output from the command */
  stdout: string;
  /** Standard error from the command */
  stderr: string;
  /** Exit code of the command (0 = success) */
  exitCode: number;
  /** Duration of the command in milliseconds */
  duration: number;
};
