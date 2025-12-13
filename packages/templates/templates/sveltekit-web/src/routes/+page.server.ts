import type { PageServerLoad } from './$types';
// @agent:inject:imports

export const load: PageServerLoad = async ({ platform }) => {
  // Database access example (uncomment when DATABASE_URL is set):
  // const db = createDb(platform?.env.DATABASE_URL ?? process.env.DATABASE_URL!);
  // const users = await db.select().from(usersTable);

  // @agent:inject:load

  return {
    // @agent:inject:data
  };
};
