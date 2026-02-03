const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  // Create Strava project
  const stravaResult = await sql`
    INSERT INTO projects (name, color, position)
    VALUES ('Strava', '#FF4500', 0)
    RETURNING id
  `;
  const stravaId = stravaResult[0].id;
  console.log('Created Strava project:', stravaId);

  // Create Portfolio project
  const portfolioResult = await sql`
    INSERT INTO projects (name, color, position)
    VALUES ('Portfolio Website', '#8B5CF6', 1)
    RETURNING id
  `;
  const portfolioId = portfolioResult[0].id;
  console.log('Created Portfolio project:', portfolioId);

  // Associate all existing epics with Strava
  await sql`
    UPDATE epics
    SET project_id = ${stravaId}
    WHERE project_id IS NULL
  `;
  console.log('Associated all existing epics with Strava project');

  // Show results
  const projects = await sql`SELECT * FROM projects ORDER BY position`;
  console.log('\nProjects:', projects);

  const epics = await sql`SELECT id, name, project_id FROM epics`;
  console.log('\nEpics:', epics);
}

setup().catch(console.error);
