const sendMassMail = require('../lib/sendMassMail')

try{
  sendMassMail(process.argv[2])
} catch(err){
  console.log(err)
}