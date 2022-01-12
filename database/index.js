const { Client } = require('pg');

// const pool = new Pool({
//   host: "localhost",
//   user: "postgres",
//   database: "products",
//   password: "123",
//   port: 5432,
//   idleTimeoutMillis: 0,
//   connectionTimeoutMillis: 0,
// });


const client = new Client({
  host: "localhost",
  user: "postgres",
  database: "products",
  password: "123",
  port: 5432,
});

client.connect()
  .then((res)=> {
    console.log('Connect to Postgres successfully!');
  })
  .catch((err) => {
    console.log(err);
  })

module.exports = {
  client,
  // pool
}