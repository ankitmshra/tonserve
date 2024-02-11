import { Client } from 'pg';
import { log } from "console"

require('dotenv').config(); // Load environment variables from a .env file

const pool = new Client({
  connectionString: 'postgres://postgres:postgres@localhost:5432/medusa-docker',
});

pool.connect();

export default class FetchAddressService {
  static async getAddress(locationId: string) {
    try {
      const query = `
        SELECT
          sa.address_1,
          sa.address_2,
          sa.city,
          sa.country_code,
          sa.phone,
          sa.province,
          sa.postal_code,
          sa.company
        FROM
          stock_location sl
        JOIN
          stock_location_address sa ON sl.address_id = sa.id
        WHERE
          sl.id = $1`;

      const result = await pool.query(query, [locationId]);

      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    } catch (error) {
      log('Error getting address:', error);
      throw error;
    }
  }
}