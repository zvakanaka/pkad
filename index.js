const exec = require('util').promisify(require('child_process').exec);

if (process.argv.length <= 2) {
  console.log('Error: missing arguments');
  console.log('Usage:\n\tpkad processName [directory]');
  return 1;
}

const directory = process.argv.length === 4 ? process.argv[process.argv.length - 1] : '.';
const currentDirectory = require('path').resolve(directory);
const programName = process.argv[2];

(async () => {
  const output = await exec(`pgrep ${programName} | while read -r line; do echo "$line"; lsof -a -d cwd -p "$line" -n -Fn | awk '/^n/ {print substr($0,2)}'; done`);
  if (output.stderr) console.error(output.stderr);
  const lines = output.stdout.split('\n');
  lines.pop(); // remove last newline
  lines.forEach(async (line, i) => {
    if (i % 2 === 0 && lines[i + 1] === currentDirectory) { // odd only and match current directory
      const killOutput = await exec(`kill -9 ${line}`);
      if (killOutput.stderr) console.error(killOutput.stderr);
    }
  });
})();
