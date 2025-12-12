/**
 * Model Router
 *
 * Routes tasks to optimal LLM models based on task type and model capabilities.
 * Quality-first approach with premium models preferred.
 */

export {
  MODEL_CAPABILITIES,
  TASK_MODEL_MAP,
  ModelRouter,
  getModelRouter,
  resetModelRouter,
  type ModelId,
  type Provider,
  type RouterMessage,
  type CompletionParams,
  type CompletionResult,
  type ModelRouterConfig,
} from './model-router';
