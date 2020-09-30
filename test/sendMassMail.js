const {sendMassMail} = require('../index')

sendMassMail(process.argv[2]).then(data => console.log(data)).catch(err=>console.log(err))