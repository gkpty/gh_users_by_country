const puppeteer = require('puppeteer-core');
const fs = require('fs')
const path = require('path')
const homeDir = require('os').homedir();
const homePath = path.join(path.relative(__dirname, '/'), homeDir)
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function twitterLogin(){
  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/chromium-browser',
    headless: false,
    userDataDir: path.join(homePath, '~/.config/chromium')
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1199, height: 900 });
    await page.goto(`https://twitter.com/`);
    rl.question("Please log in to twitter. Once you have logged in press enter", (data)=> {
      rl.close();
    });
    rl.on("close", async ()=> {
      await page.close();
      await browser.close();
      console.log("Logged in")
      return "done"
    });
  }
  catch (error) {
    console.log(error);
    await browser.close();
  }
}

async function followUsers(start, limit){
  if(!start) start=0
  if(!limit) limit=10
  let cdate = new Date()
  let cDatedMs = cdate.getTime()
  //ms per day * 3 months
  let latest_post_min = cDatedMs - 86400000*90
  let followed = 0
  let users = JSON.parse(fs.readFileSync('./users.json', 'utf8'))
  //tweet date selector
  try {
    const browser = await puppeteer.launch({ 
      executablePath: '/usr/bin/chromium-browser',
      headless: false,
      userDataDir: path.join(homePath, '~/.config/chromium')
    });
    let follow_button = '[class*="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1vuscfd r-1dhvaqw r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]'
    const page = await browser.newPage();
    await page.setViewport({ width: 1199, height: 900 });
    let ids = Object.keys(users)
    for(let i=start; i<start+limit; i++){
      let link = `https://twitter.com/${users[ids[i]].username}`;
      await page.goto(link);
      try {
        await page.waitForSelector(follow_button, {timeout: 1000})
        try {
          await page.waitForSelector('time', {timeout: 1000})
          const last_post = await page.evaluate(() => {
            let arr = new Array
            arr.push(document.querySelectorAll('time')[0].dateTime)
            arr.push(document.querySelectorAll('time')[1].dateTime)
            return arr
          });
          let post1_d = new Date(last_post[0])
          let post2_d = new Date(last_post[1])
          if(post1_d && post1_d.getTime() > latest_post_min || post2_d && post2_d.getTime() > latest_post_min){
            await page.click(follow_button);
            //console.log(last_post)
            console.log('followed '+ users[ids[i]].username)
            followed+=1
          } else console.log(`User ${users[ids[i]].username} hasnt posted anything in the last 3 months`)
        } catch(err) {`User ${users[ids[i]].username} hasnt posted anything in the last 3 months`}
      } catch (error) {console.log(`User ${users[ids[i]].username} doesnt exist in twitter or is already being followed`)}
    }
    await page.close();
    await browser.close();
    return `\x1b[32mDone! followed ${followed}/${limit} users\x1b[0m`
  }
  catch (error) {
    console.log(error);
    await browser.close();
  }
}

module.exports = {
  twitterLogin,
  followUsers
}
