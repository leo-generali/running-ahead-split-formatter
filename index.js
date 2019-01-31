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
    createFile([workoutString, splitsString].join('\n\n'));
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
  splitsArr.forEach((_, index) => {
    if (!splitsArr[index].includes('R')) {
      const { duration } = intervalArr[index];
      string += `${formatTime(duration)}\n`;
    }
  });
  return string;
};

const formatTime = (time) => {
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const remainder = time.toString().split('.')[1];
  const formattedString = `${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}.${remainder}`;
  return formattedString;
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
