require('dotenv').config()
const axios = require('axios')
const fs = require('fs')

//get the list of users by country
async function getUsers(country){
  let arr = new Array
  let obj = fs.existsSync('./users.json')? JSON.parse(fs.readFileSync('./users.json', 'utf8')): new Object
  let res = await axios.get(`https://api.github.com/search/users?q=location:${country}`)
  console.log(parseInt(process.argv[3]))
  process.argv[3] = process.argv[3]? parseInt(process.argv[3]): 1
  let limit = process.argv[3]+10
  if(limit >= res.data.total_count/30) limit = res.data.total_count
  for(let x = process.argv[3]; x < limit; x++){
    let response = await axios.get(`https://api.github.com/search/users?q=location:${country}&page=${x}`, {
      headers: {
        "Authorization": `bearer ${process.env.GH_TOKEN}`,
        "Content-Type": "application/json"
      }
    }).catch(err=> console.log(err))
    let users = response.data.items
    //console.log(users)
    for(let i in users){
      axios.get(`https://api.github.com/users/${users[i].login}`, {
        headers: {
          "Authorization": `bearer ${process.env.GH_TOKEN}`,
          "Content-Type": "application/json"
        }
      })
      .then(u => {
        let user = new Object
        let ghid = 'gh'+u.data.id
        user.source = 'github'
        user.id = u.data.id
        user.username = u.data.login
        user.name = u.data.name
        user.company = u.data.company
        user.location = u.data.location
        user.email = u.data.email
        user.public_repos = u.data.public_repos
        user.created_at = u.data.created_at
        console.log(user)
        obj[ghid] = user
        //arr.push(user)
        //console.log(i, x, limit)
        if(i >= 29 && x >= limit-1) {
          console.log('done!')
          fs.writeFileSync('./users.json', JSON.stringify(obj))
          return obj
        }
      }).catch(err=>{console.log(err)})
    }
  }
}

//convert the json to csv
function jsonToCsv(){
  let file = fs.readFileSync('./users.json', 'utf8')
  let obj = JSON.parse(file)
  let csv = new String
  let header = new Array
  for(let key in obj[Object.keys(obj)[0]]){
    header.push(key)
    csv += key+', '
  }
  //console.log(csv) 
  csv += '\n'
  for(let u in obj){
    for(let x=0; x<header.length; x++) csv += `"${obj[u][header[x]]}", `
    csv += '\n'
  }
  fs.writeFileSync('./users.csv', csv)
}

//send mass mail to users with email
async function sendMassMail(source){
  let user_obj = fs.readFileSync('users.json', 'utf8')
  let users = JSON.parse(user_obj)
  let mail_users = new Array
  for(let u in users) if(users[u].email) mail_users.push(users[u])
  let destinations = new Array
  for(let m of mail_users){
    destinations.push({
      "Destination":{
        "ToAddresses":[
          m.email
        ]
      },
      "ReplacementTemplateData":`{ \"name\":\"${m.name}\"}`
    })
  }
  let template = {
    TemplateName: "gh_users_by_country",
    SubjectPart: "Greetings, {{name}}!",
    HtmlPart: "<h1>Hola {{name}},</h1><br><p>Your favorite animal is {{favoriteanimal}}.</p>",
    TextPart: "Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}."
  }
  await ses.createTemplate(template).promise()
  var params = {
    Source: source,
    Template: "gh_users_by_country",
    ReplyToAddresses: [
      source,
    ],
    Destinations: []
  };
  ses.sendBulkTemplatedEmail(params).promise()
  .then(()=> console.log('All Done!')).catch(err=>console.log(err))
}

function twitterFollow(users){
  for(let u in users){
    axios.get(`https://api.twitter.com/1.1/users/lookup.json?screen_name=${users[u].login}`, {
      headers: {
        'authorization': 'OAuth oauth_consumer_key="consumer-key-for-app", oauth_nonce="generated-nonce", oauth_signature="generated-signature", oauth_signature_method="HMAC-SHA1", oauth_timestamp="generated-timestamp", oauth_version="1.0"',
        'content-type': 'application/json'
      }
    }).then(data => {
      axios.post(`https://api.twitter.com/1.1/friendships/create.json?user_id=${data.id}&follow=true`, 
      {
        headers: {
          'authorization': 'OAuth oauth_consumer_key="YOUR_CONSUMER_KEY", oauth_nonce="AUTO_GENERATED_NONCE", oauth_signature="AUTO_GENERATED_SIGNATURE", oauth_signature_method="HMAC-SHA1", oauth_timestamp="AUTO_GENERATED_TIMESTAMP", oauth_token="USERS_ACCESS_TOKEN", oauth_version="1.0"',
          'content-type': 'application/json'
        }
      }) 
    }).catch(err=> console.log(`${users[u].login} doesnt exist in twitter`))
  }
}

module.exports = {
  getUsers,
  jsonToCsv,
  sendMassMail,
  twitterFollow
}