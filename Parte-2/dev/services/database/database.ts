import pg from 'pg';
import logger from '../../utils/logger/logger';

const pool = new pg.Pool({
    user: 'justdancepc',
    host: 'localhost',
    database: 'dist_sys_ev_1',
    port: 5432,
    max: 20,
    ssl: {
      rejectUnauthorized: false,
    },
    min: 1,
    connectionTimeoutMillis: 20000,
  });

pool.on('error', (err, client) => {
    logger.error(err.stack);
});

export const getClient = () => {
  return pool.connect();
}

