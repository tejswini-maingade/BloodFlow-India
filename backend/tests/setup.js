// Runs before every test file. Forces a TEST database, never the dev one.
const DEFAULT_TEST_DB = 'postgresql://bloodflow:bloodflow_dev_pw@localhost:5432/bloodflow_test';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || DEFAULT_TEST_DB;
process.env.JWT_SECRET = 'test-only-secret-not-used-anywhere-else-123456';

if (!/test/i.test(new URL(process.env.DATABASE_URL).pathname)) {
  throw new Error('Refusing to run tests: the database name must contain "test".');
}
