const postgres = require('postgres')
const sql = postgres('postgres://postgres:1234@35.226.233.44:5432/postgres')
var result = sql`select * from recorrido`

console.log(result)
