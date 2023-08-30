const path = require('path');
const fs = require('fs');




module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: 'postgres',
      port: '5432',
      database: 'kennen',
      user: 'kennen_user',
      password: '983f07553',
},
    useNullAsDefault: true,
  },
});



//connection to postgresql in strapi v4
/*
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: env('DATABASE_HOST', 'db-postgresql-nyc1-64675-do-user-12753330-0.b.db.ondigitalocean.com'),
        port: env.int('DATABASE_PORT', 25060),
        database: env('DATABASE_NAME', 'kennen'),
        username: env('DATABASE_USERNAME', 'doadmin'),
        password: env('DATABASE_PASSWORD', 'AVNS_YFfHjZAV9pUg5xsgaTU'),
        ssl: env.bool('DATABASE_SSL', true),
      },
      options: {
        ssl: true,
      },
    },
  },
});

//connection to postgresql in strapi v4



module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: 'db-postgresql-nyc1-64675-do-user-12753330-0.b.db.ondigitalocean.com',
      port: '25060',
      database: 'kennen',
      user: 'doadmin',
      password: 'AVNS_YFfHjZAV9pUg5xsgaTU',
      ssl: {
        ca: fs.readFileSync(`./config/ca-certificate.crt`).toString(),
      },
},
    useNullAsDefault: true,
  },
});
*/