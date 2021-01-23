const {getFollowing} = require('../ig_puppet')
const fs = require('fs')

getFollowing('panamarquit')
.then(data=> {
  let json = JSON.parse(fs.readFileSync('following_queue.json', 'utf8'))
  console.log("length: ", Object.keys(json).length)
  console.log(data)
})
.catch(err=> console.log(err))


