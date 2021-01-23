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

async function igLogin(){
  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/chromium-browser',
    headless: false,
    userDataDir: path.join(homePath, '~/.config/chromium')
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1199, height: 900 });
    await page.goto(`https://instagram.com/`);
    rl.question("Please log in to instagram. Once you have logged in press enter", (data)=> {
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

//Follow User
async function followUser(username){
  try {
    const browser = await puppeteer.launch({ 
      executablePath: '/usr/bin/chromium-browser',
      headless: false,
      userDataDir: path.join(homePath, '~/.config/chromium')
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1199, height: 900 });
    let link = `https://instagram.com/${username}`;
    await page.goto(link);
    try {
      await page.waitForSelector('.BY3EC', {timeout: 1000})
      try {
        console.log('step 1')
        let activity = await page.evaluate(() => {
          console.log('step 2')
          let follow_button = document.getElementsByClassName('BY3EC')[0].children[0]
          if(follow_button.classList.value === "sqdOP  L3NKy   y3zKF     "){
            follow_button.click()
            return 'private account follow'
          }
          else if(follow_button.children[0] && follow_button.children[0].children[0] && follow_button.children[0].children[0].children[0]){
            console.log('public account')
            public_follow = follow_button.children[0].children[0].children[0]
            if(public_follow.classList.value === "_5f5mN       jIbKX  _6VtSN     yZn4P   "){
              public_follow.click()
              return 'public account follow'
            }
          }
        });
        console.log(activity)
      } catch(err) {console.log(err)}
    } catch (error) {console.log(`\x1b[33mUser ${users[ids[i]].username} doesnt exist in instagram or is already being followed\x1b[0m`)}
    await page.close();
    await browser.close();
    return `\x1b[32mDone! followed ${username}`
  }
  catch (error) {
    console.log(error);
    await browser.close();
  }
}

//like latest post
//if not following follow user

//Get User following list

//open user profile
//open list of people they are following
//scroll to the bottom in order to display all of the people they follow
//add each person into an array
//retuyrn array

async function getFollowing(username){
  try {
    const browser = await puppeteer.launch({ 
      executablePath: '/usr/bin/chromium-browser',
      headless: false,
      userDataDir: path.join(homePath, '~/.config/chromium')
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.setViewport({ width: 1199, height: 900 });
    let link = `https://instagram.com/${username}`;
    await page.goto(link);
    try {
      await page.waitForSelector('a.-nal3', {timeout: 1000})
      try {
        await page.evaluate(() => {
          let button = document.querySelectorAll('a.-nal3')[1]
          button.click()
        })
        console.log('done clicking button')
        await page.waitForSelector('a.FPmhX', {timeout: 1000})
        await autoScroll(page);
        let followers = await getFollowers(page)
        
        let queue = JSON.parse(fs.readFileSync('following_queue.json', 'utf8'))
        console.log(queue)
        console.log('Followers ',followers)
        let current_date = new Date()
        await followers.map(async user => {
          if(!queue[user]) queue[user] = {username:user, followed_date:'', queued_date:current_date.toString()}
        })
        console.log('NEW QUEUE', queue)
        fs.writeFileSync('following_queue.json', JSON.stringify(queue))
      } catch(err) {console.log(err)}
    } catch (error) {console.log(`\x1b[33mUser ${users[ids[i]].username} doesnt exist in instagram or is already being followed\x1b[0m`)}
    await page.close();
    await browser.close();
    return `\x1b[32mDone! followed ${username}`
  }
  catch (error) {
    console.log(error);
    await browser.close();
  }
}

async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          let modal = document.getElementsByClassName('isgrP')[0]
          var timer = setInterval(() => {
              var scrollHeight = modal.scrollHeight;
              modal.scrollBy(0, distance);
              totalHeight += distance;
              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

async function getFollowers(page){
  return await page.evaluate(async () => {
    return  await new Promise((resolve, reject) => {
        let arr = new Array()
        let users = document.querySelectorAll('a.FPmhX')
        console.log(users[0])
        console.log('Test Loggg 1')
        for(let u in users) {
          arr.push(users[u].text)
          if(u >= users.length-1){
            console.log(JSON.stringify(arr))
            console.log('Test Loggg 2')
            resolve(arr)
            return arr
          }
          
        }
        
      });
  });
}




//Get User Followers

//Unfollow User

//Unfollow User automatically


//Follow users in a list
/* async function followUsers(start, limit){
  if(!start) start=0
  if(!limit) limit=10
  let cdate = new Date()
  let cDatedMs = cdate.getTime()
  //ms per day * 3 months
  let latest_post_min = cDatedMs - 86400000*90
  let followed = 0
  let users = JSON.parse(fs.readFileSync('./users.json', 'utf8'))
  //tweet date selector
  console.log(`${Object.keys(users).length} total users`)
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
            console.log(`\x1b[32mfollowed ${users[ids[i]].username}\x1b[0m`)
            followed+=1
          } else console.log(`\x1b[33mUser ${users[ids[i]].username} hasnt posted anything in the past 3 months\x1b[0m`)
        } catch(err) {`\x1b[33mUser ${users[ids[i]].username} hasnt posted anything\x1b[0m`}
      } catch (error) {console.log(`\x1b[33mUser ${users[ids[i]].username} doesnt exist in twitter or is already being followed\x1b[0m`)}
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
 */


module.exports = {
  igLogin,
  followUser,
  getFollowing
}
