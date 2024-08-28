const fs = require('fs');
const path = require('path');

function loadGroupsData() {
  const groupsDataPath = path.join(__dirname, '..', '..', 'data', 'groups.json');
  return JSON.parse(fs.readFileSync(groupsDataPath, 'utf8'));
}

function loadExhibitionsData() {
  const exhibitionsDataPath = path.join(__dirname, '..', '..', 'data', 'exhibitions.json');
  return JSON.parse(fs.readFileSync(exhibitionsDataPath, 'utf8'));
}

module.exports = { loadGroupsData, loadExhibitionsData };
