// scripts/csv-to-json.js
const fs    = require('fs');
const { parse } = require('csv-parse/sync');

// 1) Read in your CSV
const csvText = fs.readFileSync('leetcodequestions.csv', 'utf8');

// 2) Parse all rows
const rows = parse(csvText, {
  // adjust options if your CSV has headers or different delimiters:
  columns: false,
  skip_empty_lines: true
});

// 3) Build JSON map
const data = {};
for (const row of rows) {
  // row[0]=id, row[1]=title, row[5]=topics, row[6]=difficulty
  data[row[0]] = {
    title:      row[1],
    topics:     row[5],
    difficulty: row[6]
  };
}

// 4) Write it into your functions folder
fs.writeFileSync(
  'functions/leetcodequestions.json',
  JSON.stringify(data, null, 2),
  'utf8'
);

console.log('✅ functions/leetcodequestions.json generated.');