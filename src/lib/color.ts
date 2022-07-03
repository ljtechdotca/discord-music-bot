import chalk from "chalk";

const timestamp = () => chalk.yellow(`${new Date().toLocaleTimeString()} `);

const color = (
  type: string,
  name: string,
  log: string,
  args: string | number | boolean | undefined = ""
) => {
  switch (type) {
    case "success":
      console.log(
        timestamp() +
          chalk.bold(name) +
          ": " +
          chalk.green(log) +
          " " +
          chalk.blue(args)
      );
      break;

    case "failed":
      console.log(
        timestamp() +
          chalk.bold(name) +
          ": " +
          chalk.red(log) +
          " " +
          chalk.blue(args)
      );
      break;

    case "command":
      console.log(
        timestamp() + chalk.bold(name) + ": " + log + " " + chalk.blue(args)
      );
      break;

    default:
      break;
  }
};

export default color;
