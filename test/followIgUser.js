const {followUser} = require('../ig_puppet')

followUser('panamarquit')
.then(data=> console.log(data))
.catch(err=> console.log(err))