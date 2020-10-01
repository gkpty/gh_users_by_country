const {followUsers} = require('../puppet')

followUsers(process.argv[2]? parseInt(process.argv[2]): 0, process.argv[3]? parseInt(process.argv[3]): 10)
.then(data=> console.log(data))
.catch(err=> console.log(err))