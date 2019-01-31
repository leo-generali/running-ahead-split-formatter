require('dotenv').config();

const rp = require('request-promise');
const cheerio = require('cheerio');

const re = /\[{"type":"interval"(.*)\]},/g;

console.log(process.env.URL);

rp(process.env.URL).then(function(html) {
  const $ = cheerio.load(html, { xmlMode: true });
  const str = $('script:not([src])')[4].children[0].data;
  const rawData = re.exec(str)[0].slice(0, -2);
  const arrOfData = JSON.parse(rawData);
  const workouts = arrOfData.filter((_, index) => index % 2 === 0);
  console.log(workouts);
});
