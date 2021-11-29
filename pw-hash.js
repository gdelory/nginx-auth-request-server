const bcrypt = require('bcrypt')
if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <password>`)
  process.exit(1)
}
console.log(bcrypt.hashSync(process.argv[2], 5))
