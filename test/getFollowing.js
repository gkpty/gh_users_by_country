const {getUsers} = require('../ig_puppet')
const fs = require('fs')

getUsers('panamarquit', 'following')
.then(data=> {
  let json = JSON.parse(fs.readFileSync('queue.json', 'utf8'))
  console.log("length: ", Object.keys(json).length)
  console.log(data)
})
.catch(err=> console.log(err))


