import * as commander from 'commander';
import { ReadStream } from 'tty';
import { createWriteStream } from 'fs';
import * as chalk from 'chalk';

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
  const s = `$({+${amt} ms)}`;
  if (amt < 500) {
    return s;
  }
  if (amt < 3000) return chalk.yellow(s);
  return chalk.red(s);
}

const beginTime = process.hrtime();
if (!process.stdin.isTTY) {
  let lastTime = beginTime;
  process.stdin.on('readable', function(this: ReadStream) {
    const chunk = this.read();
    if (chunk !== null) {
      const time = process.hrtime(beginTime);
      const dt = ms(time) - ms(lastTime);
      lastTime = time;
      const line = [ms(time).toFixed(2), dt.toFixed(2), chunk] as [
        string,
        string,
        string
      ];
      pipedData.push(line);
      process.stdout.write(
        `${chalk.dim(`[${line[0]} ms]`)} ${formatDelta(dt)}:\t${line[2]}`
      );
      fsWriteStream.write(line.join(','));
    }
  });
  process.stdin.on('end', function() {
    program.parse(process.argv);
    console.log(pipedData.map(line => line.join(',')).join('\n'));
  });
} else {
  program.parse(process.argv);
}
