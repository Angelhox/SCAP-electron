 const mysql=require('promise-mysql')
 const connection=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bdscapstdop2',
    port: 3308
 })
 function getConnection(){
     return connection;
 }
 module.exports={getConnection}
//const mysql = require('mysql');

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'xxxx',
//   port:3308
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error al conectar a la base de datos:', err);
//     return;
//   }
//   console.log('Conexión exitosa a la base de datos.');

//   // Aquí puedes realizar consultas y operaciones en la base de datos
// });
//  function getConnection(){
//  return connection;
//  }
//  module.exports={getConnection}