const {jsonToCsv} = require('../index')

jsonToCsv().then(data => console.log(data)).catch(err=>console.log(err))