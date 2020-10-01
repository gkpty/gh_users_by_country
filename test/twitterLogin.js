const {twitterLogin} = require('../puppet')

twitterLogin()
.catch(err=> console.log(err))