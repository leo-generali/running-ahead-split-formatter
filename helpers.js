const isInterval = (interval) => !interval.includes('R');

const formatTime = (time) => {
  const minutes = Math.floor((time % 3600) / 60);
  const rawSeconds = Math.floor(time % 60);
  const seconds = rawSeconds < 10 ? `0${rawSeconds}` : rawSeconds;

  // Garmin removes extra zeros when it sends the info
  // to RA. This adds it back in.
  // ie .2 => .20
  const rawRemainder = time.toString().split('.')[1];
  const remainder = rawRemainder < 10 ? `${rawRemainder}0` : rawRemainder;

  const formattedString = `${minutes}:${seconds}.${remainder}`;
  return formattedString;
};

module.exports = isInterval;
module.exports = formatTime;
