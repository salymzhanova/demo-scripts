function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Jira Sync Menu')
    .addItem('Input JQL Query', 'inputJqlQuery')
    .addItem('Get Status Updates', 'getStatusUpdates')
    .addToUi();
}

function inputJqlQuery() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Enter JQL Query', 'Please enter your JQL query:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() === ui.Button.OK) {
    var jqlQuery = response.getResponseText();
    syncJiraBugs(jqlQuery);
  }
}