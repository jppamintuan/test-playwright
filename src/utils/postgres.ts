import { Client } from 'pg';

// const connection = () => {    
//     return new Client({
//       host: `staging-main-postgresql.cluster-c520mzxhnbok.ap-southeast-2.rds.amazonaws.com`,
//       port: 5432,
//       user: `oidc_JohnPaul_Pamint_uat_hw_ms_kafka_sink_dev__yz8XAf72CB`,
//       database: 'postgres',
//       password: 'x-scs7YOVBAWIOcLUF5D'
//     });
// };

async function connection() {
    let host: string;
    if (process.env.TEST_ENV == 'uat')
        host = 'staging-main-postgresql.cluster-c520mzxhnbok.ap-southeast-2.rds.amazonaws.com';
    else
        host = 'development-main-postgresql.cluster-cyqahcj5izlk.ap-southeast-2.rds.amazonaws.com';
    return new Client({
        user: process.env.PG_USER_KAFKA_SINK,
        password: process.env.PG_PASSWORD_KAFKA_SINK,
        host: host,
        port: 5432,
        database: 'ms_kafka_sink_db',
    });
}

export async function testSelect1() {
  const postgres = await connection();

  postgres.connect();

  try {
    const result = await postgres.query(`select * from ms_kafka_sink_schema.message where topic = 'customer-event-topic' and datetime > now() - interval '1 day' order by datetime desc`);
    console.log(result.rows[0].message);
  } catch (err) {
    console.log('Error getting message redaction flag on query');
  }

  postgres.end();
}

export async function testSelect2() {
    const client = new Client({
        user: 'oidc_JohnPaul_Pamint_uat_hw_ms_kafka_sink_dev__yz8XAf72CB',
        password: 'x-scs7YOVBAWIOcLUF5D',
        host: 'staging-main-postgresql.cluster-c520mzxhnbok.ap-southeast-2.rds.amazonaws.com',
        port: 5432,
        database: 'ms_kafka_sink_db',
    });
      
    await client.connect();
       
    const result = await client.query(`select * from ms_kafka_sink_schema.message where topic = 'customer-event-topic' and datetime > now() - interval '1 day' order by datetime desc`);
    console.log(result.rows[0].message);

    await client.end();
}
