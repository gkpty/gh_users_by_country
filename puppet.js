const puppeteer = require('puppeteer-core');

(async event => {
  //const key_words = 'JavaScript';
  const link = 'https://twitter.com/Ahernandez2086fghfgh';

  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/chromium-browser',
    headless: false,
    userDataDir: '~/.config/chromium'
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1199, height: 900 });
    await page.goto(link);

    let follow_button = '[class*="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1vuscfd r-1dhvaqw r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]'
    
    try {
      await page.waitForSelector(follow_button, {timeout: 200})
      console.log('found button')
      await page.click(follow_button);
    } catch (error) {
      console.log('button not found')
    }
    //await page.close();
    //await browser.close();
  } catch (error) {
    console.log(error);
    //await browser.close();
  }
})();