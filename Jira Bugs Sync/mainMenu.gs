function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Jira Sync Menu')
    .addItem('Input JQL Query', 'inputJqlQuery')
    .addItem('Get Status Updates', 'getStatusUpdates')
    .addToUi();
}