class Interval {
  constructor(intervals) {
    this.intervals = intervals;
  }

  output() {
    let string = 'Workout:\n';
    this.intervals.forEach((interval) => {
      if (!interval.includes('R')) {
        string += `${interval}\n`;
      }
    });
    return string;
  }
}

module.exports = Interval;
