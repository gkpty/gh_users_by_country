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
  let template = {
    TemplateName: "ergo_mail",
    SubjectPart: "Ergonomica Standing Desks en Panama",
    HtmlPart: `<h2>Hola {{name}}</h2><p>Pienso que te pueden interesar los escritorios eléctricos ajustables (standing desks) de Ergonomica Desk. Aprovecho este correo para compartirte nuestro catálogo.</p><p>Para cualquier consulta me puedes escribir a este correo o al whatsapp. Tambien puedes revisar nuestra pagina web para obtener más informacion.</p><br>Atentamente,<br>Lucas<br>+507-6512-6446<br>https://www.ergonomicadesk.com<br><br><img width=100% src=https://gatsbycommerce233745-master.s3.amazonaws.com/public/ergonomica_catalogue_2020.jpg>`,
    TextPart: `Hola {{name}}\nPienso que te pueden interesar nuestros escritorios electricos ajustables (standing desks). Aprovecho este correo para compartitrte nuestro catálogo.\nPara cualquier consulta me puedes escribir a este correo o al whatsapp. Tambien puedes revisar nuestra pagina web para obtener más informacion.\nAtentamente,\nLucas\n+507-6512-6446\nhttps://www.ergonomicadesk.com\n`
  }
  await ses.createTemplate({Template:template}).promise().catch(async err=>{
    if(err.code === 'AlreadyExists') await ses.updateTemplate({Template:template}).promise().catch(err => {throw new Error(err)})
    else throw new Error(err)
  })
  await timeOut(1000)
  for(let x=0; x<mail_users.length; x+=50){
    let destinations = new Array
    console.log(x)
    let num = mail_users.length-x<50? mail_users.length-x: 50
    for(let m=x; m<x+num; m++){
      let first_name = mail_users[m].name? mail_users[m].name.includes(" ")? mail_users[m].name.split(" ")[0]: mail_users[m].name: "" 
      destinations.push({
        "Destination":{
          "ToAddresses":[
            mail_users[m].email
          ]
        },
        "ReplacementTemplateData":`{"name":"${first_name}"}`
      })
    } 
    var params = {
      Source: source,
      Template: "ergo_mail",
      DefaultTemplateData: `{"name":""}`,
      ReplyToAddresses: [
        source,
      ],
      Destinations: destinations
    };
    let mass_mail = await ses.sendBulkTemplatedEmail(params).promise().catch(err=>{throw new Error(err)})
    console.log(mass_mail)
    await timeOut(1500)
  }
  console.log('All Done!')
}