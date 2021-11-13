const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function ls() {
  const { stdout, stderr } = await exec('dir');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}
ls();