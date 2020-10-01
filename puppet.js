const puppeteer = require('puppeteer-core');
const fs = require('fs')


module.exports = async function followUsers(start, limit){
  if(!start) start=0
  if(!limit) limit=10
  let users = JSON.parse(fs.readFileSync('./users.json', 'utf8'))
  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/chromium-browser',
    headless: false,
    userDataDir: '~/.config/chromium'
  });
  let follow_button = '[class*="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1vuscfd r-1dhvaqw r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]'
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1199, height: 900 });
    let ids = Object.keys(users)
    for(let i=start; i<start+limit; i++){
      let link = `https://twitter.com/${users[ids[i]].username}`;
      try {
        await page.goto(link);
        await page.waitForSelector(follow_button, {timeout: 1000})
        await page.click(follow_button);
        console.log('followed '+ users[ids[i]].username)
      } catch (error) {
        console.log(`User ${users[ids[i]].username} doesnt exist in twitter or is already being followed`)
      }
    }
    await page.close();
    await browser.close();
  }
  catch (error) {
    console.log(error);
    await browser.close();
  }
}
