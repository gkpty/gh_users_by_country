require('dotenv').config()
const fs = require('fs')
const AWS = require('aws-sdk');
var ses = new AWS.SES({apiVersion: '2010-12-01'});

function timeOut(ms) {
  return new Promise((resolve)=>{
    setTimeout(resolve('done'), ms)
  })
}

//Uses AWS SES to send mass mail with a template to a given set fo users saved in users.json
module.exports = async function sendMassMail(source){
  let users = JSON.parse(fs.readFileSync('users.json', 'utf8'))
  let mail_users = new Array
  for(let u in users) if(users[u].email) mail_users.push(users[u])
  let destinations = new Array
  for(let m of mail_users){
    let first_name = m.name? m.name.includes(" ")? m.name.split(" ")[0]: m.name: "" 
    destinations.push({
      "Destination":{
        "ToAddresses":[
          m.email
        ]
      },
      "ReplacementTemplateData":`{"name":"${first_name}"}`
    })
  }
  let template = {
    TemplateName: "gh_users",
    SubjectPart: "Hola {{name}}, estás invitadx a Hacktoberfest Panamá 2020",
    HtmlPart: `<h2>Hola {{name}},</h2><p>Me encontré con tu perfil en Github y pensé que te pudiera interesar un evento que estamos organizando para Hacktoberfest, este domingo 4 de octubre 2020 a las 2:00PM.</p> <p>Vamos a estar hablando sobre git, colaborar en <b>open-source</b>, y cómo aprender <b>nuevos lenguajes y frameworks</b> más fácil. La idea es promocionar la participación en proyectos de open-source y aportar a crear una comunidad nueva e inclusiva de desarrolladores panameñxs.</p><p>Si esto es algo que te interesa, puedes registrarte al evento a través del siguiente <a href=https://organize.mlh.io/participants/events/4765-hacktoberfest-en-espanol-panama>enlace</a></p><p>Te cuento también que vamos a estar organizando una sección de demos de 3-5 minutos al final del evento. Si tienes algún proyecto open-source que te interesaría mostrar, puedes responderme a este correo con el link al proyecto y una explicación y empezamos a coordinar.</p>Nos vemos en Zoom: <a href="https://us02web.zoom.us/j/81910711595?pwd=U1dLY2xTNU82c1AyZTlwZE1OWmZaZz09">https://us02web.zoom.us/j/81910711595?pwd=U1dLY2xTNU82c1AyZTlwZE1OWmZaZz09</a><br><br>Agregar a tu calendario <a href=https://calendar.google.com/event?action=TEMPLATE&tmeid=MDc2bzFhY2FyNWs3Mm81dWVvb2ptMzhjc3YgY19ocWFhbjVsaGxucWQwaXBrOHVuMnQ2cWJ1a0Bn&tmsrc=c_hqaan5lhlnqd0ipk8un2t6qbuk%40group.calendar.google.com>aquí</a><br><br>Saludos,<br>Lucas<br><img width=40% src=https://s3.us-east-1.amazonaws.com/panamadevhub.com/dev_hub_logo.png><br><br><img width=100% src=https://s3.us-east-1.amazonaws.com/panamadevhub.com/hf_panama_email.png>`,
    TextPart: `Hola {{name}},\nMe encontré con tu perfil en Github y pensé que te pudiera interesar un evento que estamos organizando para Hacktoberfest, este domingo 4 de octubre 2020 a las 2:00PM. \nVamos a estar hablando sobre git, colaborar en open-source, y cómo aprender nuevos lenguajes y frameworks más fácil. La idea es promocionar la participación en proyectos de open-source y aportar a crear una comunidad nueva e inclusiva de desarrolladores panameñxs.\nSi esto es algo que te interesa, puedes registrarte al evento a través del siguiente enlace: \nhttps://organize.mlh.io/participants/events/4765-hacktoberfest-en-espanol-panama\nTe cuento también que vamos a estar organizando una sección de demos de 3-5 minutos al final del evento. Si tienes algún proyecto open-source que te interesaría mostrar, puedes responderme a este correo con el link al proyecto y una explicación y empezamos a coordinar.\nNos vemos en Zoom: https://us02web.zoom.us/j/81910711595?pwd=U1dLY2xTNU82c1AyZTlwZE1OWmZaZz09\n<Agregar a tu calendario aquí>\nSaludos,\nLucas\n`
  }
  await ses.createTemplate({Template:template}).promise().catch(async err=>{
    if(err.code === 'AlreadyExists') await ses.updateTemplate({Template:template}).promise().catch(err => {throw new Error(err)})
    else throw new Error(err)
  })
  await timeOut(1000)
  var params = {
    Source: source,
    Template: "gh_users",
    DefaultTemplateData: `{"name":""}`,
    ReplyToAddresses: [
      source,
    ],
    Destinations: destinations
  };
  await ses.sendBulkTemplatedEmail(params).promise().catch(err=>{throw new Error(err)})
  console.log('All Done!')
}