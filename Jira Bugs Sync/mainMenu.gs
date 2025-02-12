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

function getStatusUpdates() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var keyColumn = 1; // Assuming keys are in Column A
    var statusColumn = 3; // Assuming status is in Column C
    var startRow = 2; // Assuming data starts from row 2

    var lastRow = sheet.getLastRow();
    var keys = sheet.getRange(startRow, keyColumn, lastRow - startRow + 1, 1).getValues().flat();

    // Log only the number of keys processed (avoid logging sensitive info like keys directly)
    console.log("Processing " + keys.length + " Jira issues.");

    // Create a map to store the row index for each key
    var keyRowIndexMap = {};
    keys.forEach(function(key, index) {
      keyRowIndexMap[key] = index + startRow;
    });

    // Fetch status updates from Jira, ensure no sensitive data is logged
    var statusUpdates = fetchIssuesFromJira("key in (" + keys.map(function(k) { return "'" + k + "'"; }).join(",") + ")");
    console.log("Fetched status updates from Jira.");

    // Iterate through the retrieved issues
    for (var i = 0; i < statusUpdates.length; i++) {
      var jiraIssue = statusUpdates[i];
      var key = jiraIssue.key;
      var newStatus = jiraIssue.fields.status.name;

      // Find the corresponding row in the sheet using the map
      var rowIndex = keyRowIndexMap[key];
      if (rowIndex) {
        var currentStatus = sheet.getRange(rowIndex, statusColumn).getValue();

        // Only log the keys and status changes, without logging the entire issue
        if (currentStatus !== newStatus) {
          console.log("Updating status for issue " + key + ": " + currentStatus + " → " + newStatus);
          sheet.getRange(rowIndex, statusColumn).setValue(newStatus);
        }
      }
    }

  } catch (error) {
    console.error("An error occurred while fetching or updating Jira status: " + error.message);
  }
}