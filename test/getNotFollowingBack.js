const {getNotFollowingBack} = require('../ig_puppet')
const fs = require('fs')


var startTime, endTime;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  var seconds = Math.round(timeDiff);
  console.log(seconds + " seconds");
}

start()
getNotFollowingBack('davidsanchez0761')
.then(data=> {
  end()
  console.log(data)
})
.catch(err=> console.log(err))


