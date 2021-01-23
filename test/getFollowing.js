const {getFollowing} = require('../ig_puppet')

getFollowing('panamarquit')
.then(data=> console.log(data))
.catch(err=> console.log(err))