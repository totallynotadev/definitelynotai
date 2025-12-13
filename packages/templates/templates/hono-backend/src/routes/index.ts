import { Hono } from 'hono';
import type { Env, Variables } from '../types/index.js';
import { healthRoutes } from './health.js';

// @agent:inject:imports

const routes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Health routes (for internal checks)
routes.route('/health', healthRoutes);

// @agent:inject:routes

export { routes };
