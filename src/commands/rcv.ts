import * as commander from 'commander';
import { ReadStream } from 'tty';
import { createWriteStream } from 'fs';
import * as chalk from 'chalk';
import * as leftpad from 'left-pad';

export const pipedData: [string, string, string][] = [];

const program = commander;

function ms([sec, nano]: [number, number]): number {
  return sec * 1000 + nano / 1000000;
}

const fsWriteStream = createWriteStream('clizer.log', {
  flags: 'w',
  autoClose: true,
  encoding: 'utf-8'
});

function formatDelta(amt: number): string {
  const s = `(+${leftpad('' + amt.toFixed(2), 10)} ms)`;
  if (amt < 500) {
    return chalk.green(s);
  }
  if (amt < 2000) return chalk.bgYellow.black(s);
  if (amt < 4000) return chalk.bgYellowBright.black(s);
  if (amt < 8000) return chalk.bgRed.dim(s);
  return chalk.bgRedBright.white(s);
}

const beginTime = process.hrtime();

if (!process.stdin.isTTY) {
  let lastTime = beginTime;
  process.stdin.on('readable', function(this: ReadStream) {
    const chunk = this.read();
    if (chunk !== null) {
      const time = process.hrtime(beginTime);
      const dt = Math.max(ms(time) - ms(lastTime), 0);
      lastTime = time;
      const timeInMs = ms(time);
      const line = [timeInMs.toFixed(2), dt.toFixed(2), chunk] as [
        string,
        string,
        string
      ];
      pipedData.push(line);
      ('' + chunk).split('\n').forEach(l => {
        process.stdout.write(
          `${chalk.dim(`[${leftpad('' + line[0], 10)} ms]`)} ${formatDelta(
            dt
          )}\t${l}\n`
        );
      });
      fsWriteStream.write(line.join(','));
    }
  });
  process.stdin.on('end', function() {
    program.parse(process.argv);
  });
  process.on('exit', function() {
    fsWriteStream.close();
  });
} else {
  program.parse(process.argv);
}
