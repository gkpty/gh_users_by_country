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

//convert csv to json
function csvToJson(){
  let file = fs.readFileSync('./steve_ml.csv', 'utf8')
  let header = file.split('\n')[0]
  let header_keys = header.split(', ')
  let body = file.split('\n')
  let obj = {}
  for(let i=1; i<body.length-1; i++){
    let elems = body[i].split('", ')
    let id = elems[0].substr(1,elems[0].length-1)+elems[1].substr(1,elems[1].length-1)
    obj[id]={}
    for(let x=0; x<elems.length-1; x++){
      obj[id][header_keys[x]]=elems[x].substr(1,elems[x].length-1)
    }
  }
  fs.writeFileSync('./testusers1.json', JSON.stringify(obj))
}

//send mass mail to users with email
async function sendMassMail(source){
  let users = {
    lucas:{name:'lucas kardonski', email:'lucas@torus-digital.com'},
    gabriel:{name:'gabriel kardonski', email:'gkardonski@gmail.com'},
    joespeh:{name:'lucas kardonski', email:'lucas.kardonski@gmail.com'}
  }
  //let user_obj = fs.readFileSync('users.json', 'utf8')
  //let users = JSON.parse(user_obj)
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
    SubjectPart: "Hola {{name}}, estás invitadx a Hacktoberfest Panamá 2020",
    HtmlPart: `<h2>Hola {{name}},</h2><br><p>Me encontré con tu perfil en Github y pensé que te pudiera interesar un evento que estamos organizando para Hacktoberfest, este domingo 4 de octubre 2020 a las 2:00PM.</p> <br><p>Vamos a estar hablando sobre git, colaborar en <b>open-source</b>, y cómo aprender <b>nuevos lenguajes y frameworks</b> más fácil. La idea es promocionar la participación en proyectos de open-source y aportar a crear una comunidad nueva e inclusiva de desarrolladores panameñxs.</p><br><p>Si esto es algo que te interesa, puedes registrarte al evento a través del siguiente <a href=”https://organize.mlh.io/participants/events/4765-hacktoberfest-en-espanol-panama”>enlace</a></p><br><p>Te cuento también que vamos a estar organizando una sección de demos de 3-5 minutos al final del evento. Si tienes algún proyecto open-source que te interesaría mostrar, puedes responderme a este correo con el link al proyecto y una explicación y empezamos a coordinar.</p><br>Nos vemos en Zoom: <a href="https://us02web.zoom.us/j/81910711595?pwd=U1dLY2xTNU82c1AyZTlwZE1OWmZaZz09">https://us02web.zoom.us/j/81910711595?pwd=U1dLY2xTNU82c1AyZTlwZE1OWmZaZz09</a><Agregar a tu calendario aquí>Saludos,Lucas<img src=”https://s3.us-east-1.amazonaws.com/panamadevhub.com/hf_panama_email.png”>`,
    TextPart: `Hola {{name}},\nMe encontré con tu perfil en Github y pensé que te pudiera interesar un evento que estamos organizando para Hacktoberfest, este domingo 4 de octubre 2020 a las 2:00PM. \nVamos a estar hablando sobre git, colaborar en open-source, y cómo aprender nuevos lenguajes y frameworks más fácil. La idea es promocionar la participación en proyectos de open-source y aportar a crear una comunidad nueva e inclusiva de desarrolladores panameñxs.\nSi esto es algo que te interesa, puedes registrarte al evento a través del siguiente enlace: \nhttps://organize.mlh.io/participants/events/4765-hacktoberfest-en-espanol-panama\nTe cuento también que vamos a estar organizando una sección de demos de 3-5 minutos al final del evento. Si tienes algún proyecto open-source que te interesaría mostrar, puedes responderme a este correo con el link al proyecto y una explicación y empezamos a coordinar.\nNos vemos en Zoom: https://us02web.zoom.us/j/81910711595?pwd=U1dLY2xTNU82c1AyZTlwZE1OWmZaZz09\n<Agregar a tu calendario aquí>\nSaludos,\nLucas\n`
  }
  await ses.createTemplate(template).promise()
  var params = {
    Source: source,
    Template: "gh_users_by_country",
    ReplyToAddresses: [
      source,
    ],
    Destinations: destinations
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
  csvToJson,
  sendMassMail,
  twitterFollow
}