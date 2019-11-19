import * as commander from 'commander';
import { ReadStream } from 'tty';

export const pipedData: [string, string, string][] = [];

const program = commander;

function ms([sec, nano]: [number, number]) {
  return sec * 1000 + nano / 1000000;
}

const beginTime = process.hrtime();
if (!process.stdin.isTTY) {
  let lastTime = beginTime;
  process.stdin.on('readable', function(this: ReadStream) {
    let chunk = this.read();
    if (chunk !== null) {
      let time = process.hrtime(beginTime);
      let dt = ms(time) - ms(lastTime);
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
