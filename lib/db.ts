import { neon, NeonQueryFunction } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_nPkZXqENy2I9@ep-dawn-math-aidqyj66-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    _sql = neon(DATABASE_URL);
  }
  return _sql;
}

export default getDb;
