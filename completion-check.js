const fs = require('fs');
const path = require('path');

/*
  Fill in the blanks in the file to create a convincing narrative. 
  Match the number of letters to the number of dashes on each line exactly.
 */

// 1. Get path and read the file as a raw string
const targetFile = process.argv[2];
if (!targetFile) {
  console.log('file required');
  process.exit(1);
  return;
}

const absolutePath = path.resolve(targetFile);
const fileContent = fs.readFileSync(absolutePath, 'utf8');

const rawPath = path.resolve('data/compression/theImage-lines.json');
const rawContent = fs.readFileSync(rawPath, 'utf8');
const raw = JSON.parse(rawContent);

const data = JSON.parse(fileContent);

function generateLayout(data) {
  const sortedLines = Object.values(data.lines).sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return a.y - b.y;
  });
  return sortedLines.map(lineObj => (lineObj.line || "").replace(/_/g, '-').trim());
}

function validateLayout(layout, raw) {

  for (let i = 0; i < raw.length; i++) {
    console.log('\n', i);
    console.log('  ' + layout[i]);
    console.log('  ' + raw[i]);
  }
  console.log('\n------------------------------------------------------------');
  
  if (layout.length !== raw.length) {
    console.log('Invalid line-counts:', layout.length, raw.length);
    return false;
  }
  for (let i = 0; i < layout.length; i++) {
    if (layout[i].length !== raw[i].length) {
      console.error('\nLine length mismatch at line ' + i + ':\n');
      console.error('^' + layout[i] + '$');
      console.error('^' + raw[i] + '$');
      console.error();

      return false;
    }
  }
  return true;
}

if (validateLayout(data, raw)) {
  console.log('Validated');
  console.log(data);
  console.log(raw);
}
