require('dotenv').config();
const Interval = require('./classes/interval');
const Split = require('./classes/split');

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

const re = /\[{"type":"interval"(.*)\]},/g;

const run = async () => {
  init();
  const answer = await askQuestion();
  const { workoutDistances } = answer;
  const intervals = new Interval(workoutDistances);
  getWorkouts().then((workoutIntervalData) => {
    const splits = new Split(workoutDistances, workoutIntervalData);
    createFile([intervals.output(), splits.output()].join('\n'));
    complete();
  });
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

const complete = () => {
  console.log(chalk.green('Succesfully formatted your splits!'));
};

const createFile = (string) => {
  fs.writeFile('workout.txt', string, (err) => {
    if (err) return console.log(err);
  });
};

const getWorkouts = async () => {
  const html = await rp(process.env.URL);
  const $ = cheerio.load(html, { xmlMode: true });
  const str = $('script:not([src])')[4].children[0].data;
  const rawData = re.exec(str)[0].slice(0, -2);
  const arrOfData = JSON.parse(rawData);
  return arrOfData;
};

run();
