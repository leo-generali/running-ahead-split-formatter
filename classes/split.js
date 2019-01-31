const formatTime = require('../helpers');

class Split {
  constructor(distances, timeObject) {
    this.distances = distances;
    this.timeObject = timeObject;
  }

  output() {
    let string = 'Splits:\n';
    this.distances.forEach((distance, index) => {
      if (!distance.includes('R')) {
        const { duration } = this.timeObject[index];
        const fourHundredSplit = this.fourHundredMeterSplit(distance, duration);
        string += `${formatTime(duration)} (~${fourHundredSplit}/400m)\n`;
      }
    });
    return string;
  }

  fourHundredMeterSplit(distance, time) {
    const ratio = 1600 / distance;
    return Math.floor((time * ratio) / 4);
  }
}

module.exports = Split;
