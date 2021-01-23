const {igLogin} = require('../ig_puppet')

igLogin()
.catch(err=> console.log(err))