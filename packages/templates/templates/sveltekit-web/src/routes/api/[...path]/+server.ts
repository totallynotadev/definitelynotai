import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// @agent:inject:imports

// @agent:inject:handlers

export const GET: RequestHandler = async ({ params, url }) => {
  const path = params.path;

  // @agent:inject:get-routes

  return json({ error: 'Not found' }, { status: 404 });
};

export const POST: RequestHandler = async ({ params, request }) => {
  const path = params.path;
  const body = await request.json();

  // @agent:inject:post-routes

  return json({ error: 'Not found' }, { status: 404 });
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const path = params.path;
  const body = await request.json();

  // @agent:inject:put-routes

  return json({ error: 'Not found' }, { status: 404 });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const path = params.path;

  // @agent:inject:delete-routes

  return json({ error: 'Not found' }, { status: 404 });
};
