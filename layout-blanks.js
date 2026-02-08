const fs = require('fs');
const path = require('path');

/*
  Fill in the blanks in the file to create a convincing narrative. 
  Match the number of letters to the number of dashes on each line exactly.
 */


let data = {
  layout: 0,
  original: 0,
  completions: [{
    metadata: {
      model: {
        name: "%%%MODEL.NAME%%%",
        options: "%%%MODEL.OPTIONS%%%",
        timestamp: "%%%MODEL.DATE%%%",
        prompt: "%%%MODEL.PROMPT%%%"
      },
      reader: {
        name: "perigram-reader",
        timestamp: "%%%READER.TIMESTAMP%%%",
        passes: 1,
      }
    },
    fills: "%%%FILLS%%%",
  }],
}

// 1. Get path and read the file as a raw string
const targetFile = process.argv[2];
if (!targetFile) {
  console.log('file required');
  process.exit(1);
  return;
}

// // Optional 2nd argument file with fills data
// if (process.argv[3]) {
//   const fillsFile = process.argv[3];
//   if (!fillsFile) {
//     console.log('fills file required');
//     process.exit(1);
//     return;
//   }
//   const fillsContent = fs.readFileSync(fillsFile, 'utf8');
//   const fills = JSON.parse(fillsContent);
//   data.completions.fills = fills;
// }

const absolutePath = path.resolve(targetFile);
const fileContent = fs.readFileSync(absolutePath, 'utf8');
const layoutLines = JSON.parse(fileContent);

const rawPath = path.resolve('data/compression/theImage-lines.json');
const rawContent = fs.readFileSync(rawPath, 'utf8');
const originalLines = JSON.parse(rawContent);

function generateLayout(dataobj) {
  const sortedLines = Object.values(dataobj.lines).sort((a, b) => {
    return (a.page !== b.page) ? a.page - b.page : a.y - b.y;
  });
  return sortedLines.map(lineObj => (lineObj.line || "").replace(/_/g, '-').trim());
}

function validateLayout(layout, raw) {

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

// function saveBlanks(inputPath, layoutArray) {
//   const pathInfo = path.parse(inputPath);
//   // Constructs name: [original name]-layout.js
//   const outputName = `${pathInfo.name}-blanks.txt`;
//   const outputPath = path.join(pathInfo.dir, outputName);
//   const content = layoutArray.join('\n');
//   fs.writeFileSync(outputPath, content, 'utf8');
//   console.log(`Saved: ${outputName}\n`);
// }

function saveLayout(inputPath, layoutArray, originalArray, type = '.js') {
  const pathInfo = path.parse(inputPath);
  // Constructs name: [original name]-layout.js
  const outputName = `${pathInfo.name}-data`;
  const fileExt = type === '.json' ? '.json' : '.js';
  let outputPath = path.join(pathInfo.dir, outputName + fileExt);

  // Ensures the output directory exists
  if (!fs.existsSync(pathInfo.dir)) fs.mkdirSync(pathInfo.dir);

  // if the file already exists, append a number to the name before the extension
  let i = 1;
  while (fs.existsSync(outputPath)) {
    outputPath = path.join(pathInfo.dir, `${outputName}-${i++}${fileExt}`);
    //console.log('checking ', outputPath);
  }

  // Formats the array as a JS variable for the output file
  // let content = JSON.stringify(layoutArray, null, 2).replace(/"/g, '');
  // if (type !== '.json') {
  //   const unquoted = content.replace(/"([^"]+)":/g, '$1:');
  //   content = `const data = ${unquoted};`;
  // }
  data.layout = layoutArray;
  data.original = originalArray;
  let content = JSON.stringify(data, null, 2);//.replace(/"/g, '');
  if (type !== '.json') {
    const unquoted = content.replace(/"([^"]+)":/g, '$1:');
    content = `const data = ${unquoted};`;
  }
  //console.log(content);
  
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`\nSaved: ${outputPath}\n`);
}

const result = generateLayout(layoutLines);
if (validateLayout(result, originalLines)) {
  saveLayout(absolutePath, result, originalLines);
}
