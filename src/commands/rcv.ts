import * as commander from 'commander';
import { ReadStream } from 'tty';

export const pipedData: [string, string, string][] = [];

const program = commander;

function ms([sec, nano]: [number, number]): number {
  return sec * 1000 + nano / 1000000;
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
      pipedData.push([ms(time).toFixed(2), dt.toFixed(2), chunk]);
    }
  });
  process.stdin.on('end', function() {
    program.parse(process.argv);
    console.log(pipedData.map(line => line.join(',')).join('\n'));
  });
} else {
  program.parse(process.argv);
}
