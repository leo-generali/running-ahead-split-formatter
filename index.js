require('dotenv').config();
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shell');
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

const re = /\[{"type":"interval"(.*)\]},/g;

const run = async () => {
  init();
  const answer = await askQuestion();
  const { workoutDistances } = answer;
  const workoutString = workoutArrayToString(workoutDistances);
  getWorkouts().then((workoutIntervalData) => {
    const splitsString = intervalArrayToString(
      workoutIntervalData,
      workoutDistances
    );
    createFile([workoutString, splitsString].join('\n'));
  });

  // const workoutString = workoutToString(workoutDistances);
  // createFile(workoutString);
  // show success message
};

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('RA Splits to Share', {
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
};

const askQuestion = () => {
  const questions = [
    {
      name: 'workoutDistances',
      type: 'input',
      message:
        'What were the distances for the workout? Use R to designate a rest interval',
      filter: (val) => val.split(',')
    }
  ];

  return inquirer.prompt(questions);
};

const workoutArrayToString = (array) => {
  let string = 'Workout:\n';
  array.forEach((rep) => {
    if (!rep.includes('R')) {
      string += `${rep}\n`;
    }
  });
  return string;
};

const intervalArrayToString = (intervalArr, splitsArr) => {
  let string = 'Splits:\n';
  splitsArr.forEach((split, index) => {
    if (!split.includes('R')) {
      const { duration } = intervalArr[index];
      const fourHundredSplit = calculateFourHundredMeterSplit(
        duration,
        parseInt(split)
      );
      string += `${formatTime(duration)} (~${fourHundredSplit}/400m)\n`;
    }
  });
  return string;
};

const formatTime = (time) => {
  const minutes = Math.floor((time % 3600) / 60);
  const rawSeconds = Math.floor(time % 60);
  const seconds = rawSeconds < 10 ? `0${seconds}` : rawSeconds;

  // Garmin removes extra zeros when it sends the info
  // to RA. This adds it back in.
  // ie .2 => .20
  const rawRemainder = time.toString().split('.')[1];
  const remainder = rawRemainder < 10 ? `${rawRemainder}0` : rawRemainder;

  const formattedString = `${minutes}:${seconds}.${remainder}`;
  return formattedString;
};

const calculateFourHundredMeterSplit = (duration, split) => {
  const ratio = 1600 / split;
  return Math.floor((duration * ratio) / 4);
};

const createFile = (string) => {
  fs.writeFile('workout.md', string, function(err) {
    if (err) return console.log(err);
  });
};

function getWorkouts() {
  return rp(process.env.URL).then(function(html) {
    const $ = cheerio.load(html, { xmlMode: true });
    const str = $('script:not([src])')[4].children[0].data;
    const rawData = re.exec(str)[0].slice(0, -2);
    const arrOfData = JSON.parse(rawData);
    // const workouts = arrOfData.filter((_, index) => index % 2 === 0);
    return arrOfData;
  });
}

// const getWorkouts = () =>
//   rp(process.env.URL).then(function(html) {
//     const $ = cheerio.load(html, { xmlMode: true });
//     const str = $('script:not([src])')[4].children[0].data;
//     const rawData = re.exec(str)[0].slice(0, -2);
//     const arrOfData = JSON.parse(rawData);
//     // const workouts = arrOfData.filter((_, index) => index % 2 === 0);
//     return arrOfData;
//   });

run();
