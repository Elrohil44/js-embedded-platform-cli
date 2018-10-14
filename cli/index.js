const fs = require('fs');
const { execSync } = require('child_process');
const options = require('minimist')(process.argv.slice(2));
const project = require('./package');

const SUPPORTED_PLATFORMS = [
  'nucleo-f429zi',
];

const DOWNLOAD_COMMAND = 'download';
const UPLOAD_COMMAND = 'upload';

const SOURCE_CODE_DIR = 'js-embedded-platform';

function printUsage() {
  console.log(project['firmware-repository']);
  console.log(options);
  console.log([
    '',
    '  Usage: js-embedded-platform [command] [options]',
    '',
    '',
    '  Commands:',
    '',
    '    download - download source code required to build firmware',
    '    upload --platform [PLATFORM] - compile and upload firmware to device',
    '',
    '  Options:',
    '',
    '    -h, --help     output usage information',
    '    -p, --platform set target platform. Use --platform to see available platforms.',
    '',
  ].join('\n'));
}

if (options._.length === 0 && !options.h && !options.help) {
  printUsage();
  process.exit(0);
}


function cloneRepository() {
  if (fs.existsSync(SOURCE_CODE_DIR)) {
    console.warn(`Directory ${SOURCE_CODE_DIR} already exists`);
    process.exit(1);
  }
  const cloneCommand = `git clone ${project['firmware-repository']}`;
  try {
    execSync(cloneCommand, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Command \`${cloneCommand}\` failed.`);
    process.exit(1);
  }
}

function uploadFirmware(opts) {
  if (!opts.platform && !opts.p) {
    printUsage();
    process.exit(1);
  }
  const platform = opts.platform || opts.p;
  if (SUPPORTED_PLATFORMS.indexOf(platform) !== -1) {
    if (!fs.existsSync(SOURCE_CODE_DIR)) {
      console.warn(`Directory ${SOURCE_CODE_DIR} does not exist. Download firmware source code first!`);
      process.exit(1);
    }
    const uploadCommand = `cmake ./${SOURCE_CODE_DIR} -DPLATFORM=${platform} && make UPLOAD`;
    try {
      execSync(uploadCommand);
    } catch (err) {
      console.error(`Command \`${uploadCommand}\` failed.`);
      process.exit(1);
    }
  } else {
    console.log([
      '',
      'Supported platforms:',
      '',
      ...SUPPORTED_PLATFORMS,
      '',
    ].join('\n'));
  }
}


const command = options._[0];
switch (command) {
  case DOWNLOAD_COMMAND:
    cloneRepository();
    break;
  case UPLOAD_COMMAND:
    uploadFirmware(options);
    break;
  default:
    printUsage();
}

process.exit(0);
