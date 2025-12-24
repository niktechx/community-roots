import { NextApiRequest, NextApiResponse } from 'next';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j+s://9e21daa9.databases.neo4j.io',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = driver.session();

  try {
    if (req.method === 'GET') {
      const result = await session.run(
        'MATCH (p:Person) RETURN p LIMIT 1000'
      );
      res.status(200).json(
        result.records.map(record => record.get('p').properties)
      );
    } else if (req.method === 'POST') {
      const { people } = req.body;
      for (const person of people) {
        await session.run(
          `MERGE (p:Person {id: $id}) SET p += $props`,
          { id: person.id, props: person }
        );
      }
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await session.close();
  }
}
