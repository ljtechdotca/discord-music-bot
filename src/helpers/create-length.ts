const doubleDigits = (num: number) => {
  return num.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
};

const createLength = (secs: string) => {
  const secsNum = parseInt(secs);
  const hours = doubleDigits(Math.floor(secsNum / 3600));
  const minutes = doubleDigits(Math.floor(secsNum / 60) % 60);
  const seconds = doubleDigits(secsNum % 60);
  const result = `${hours}:${minutes}:${seconds}`;
  return result;
};

export default createLength;
