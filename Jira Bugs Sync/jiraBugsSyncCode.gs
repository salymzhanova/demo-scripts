function syncJiraBugs(jqlQuery) {
  try {
    // Fetch Jira issues based on the provided JQL query
    var issues = fetchIssuesFromJira(jqlQuery);
    // Process the retrieved issues to extract and format necessary data
    var processedData = processIssues(issues);
    // Write the processed data to the active Google Sheet
    writeToSheet(processedData);
  } catch (error) {
    console.error("Error occurred: " + error.toString());
    }
  }

function fetchIssuesFromJira(jqlQuery) {
  // Securely fetch Jira credentials using PropertiesService (or use OAuth)
  var jiraUrl = PropertiesService.getScriptProperties().getProperty("JIRA_BASE_URL");
  var jiraUsername = PropertiesService.getScriptProperties().getProperty("JIRA_USERNAME");
  var jiraPassword = PropertiesService.getScriptProperties().getProperty("JIRA_API_TOKEN");

  if (!jiraUsername || !jiraPassword) {
    console.error("Jira credentials are not set in the script properties.");
    return;
  }

  var encodedJqlQuery = encodeURIComponent(jqlQuery);
  var maxResults = 50;
  var startAt = 0;
  var allIssues = [];

  try {
    while (true) {
      var endpoint = jiraUrl + "/rest/api/2/search?jql=" + encodedJqlQuery +
                    "&startAt=" + startAt + "&maxResults=" + maxResults;
      var options = {
        method: "GET",
        headers: {
          "Authorization": "Basic " + Utilities.base64Encode(jiraUsername + ":" + jiraPassword),
          "Content-Type": "application/json"
        },
        muteHttpExceptions: true
      };

      var response = UrlFetchApp.fetch(endpoint, options);
      var responseData = JSON.parse(response.getContentText());

      // Handle API errors
      if (responseData.errorMessages) {
        console.error("Jira API error:", responseData.errorMessages);
        throw new Error("Failed to fetch Jira issues");
      }

      var issues = responseData.issues;
      if (issues.length === 0) {
        break;  // No more issues, exit the loop
      }

      // Add issues to the result array
      allIssues = allIssues.concat(issues);
      startAt += maxResults; // Increment the startAt for the next page
    }

    return allIssues;
  } catch (error) {
    console.error("Error fetching Jira issues: ", error.message);
    throw error; // Rethrow the error so it can be handled upstream
  }
}

function processIssues(issues) {
  return issues.map(function(issue) {
    var key = issue.key;
    // Use a dynamic Jira URL
    var issueUrl = PropertiesService.getScriptProperties().getProperty("JIRA_BASE_URL") + "browse/" + key;
    var keyHyperLink = '=HYPERLINK("' + issueUrl + '","' + key + '")';

    var summary = issue.fields.summary;
    var status = issue.fields.status.name;
    var createdDate  = new Date(issue.fields.created);
    var formattedCreatedDate = Utilities.formatDate(createdDate, "GMT", "MM/dd/yyyy hh:mm a");
    var resolvedDate  = new Date(issue.fields.resolutiondate);
    var formattedResolvedDate = Utilities.formatDate(resolvedDate, "GMT", "MM/dd/yyyy hh:mm a");
    var labels = issue.fields.labels;
    var components = issue.fields.components ? issue.fields.components.map(function(component) {
      return component.name;
    }).join(', ') : '';  // Handle undefined components gracefully
    var projectName = issue.fields.project.name;

    // Get linked issues (uncomment filter logic if needed)
    var linkedIssues = issue.fields.issuelinks ? issue.fields.issuelinks
      .filter(function(link) {
        // Uncomment and use this filter if required
        // return link.outwardIssue && (link.type.name === "Blocks" || link.type.name === "is blocked by");
        return link.outwardIssue;
      })
      .map(function(link) {
        var linkedKey = link.outwardIssue.key;
        var linkedIssuesUrl = PropertiesService.getScriptProperties().getProperty("JIRA_BASE_URL") + "browse/" + linkedKey;
        return '=HYPERLINK("' + linkedIssuesUrl + '","' + linkedKey + '")';
      })
      .join("; ")
      : '';

    return [keyHyperLink, summary, status, formattedCreatedDate, formattedResolvedDate, labels, components, projectName, linkedIssues];
  });
}

function writeToSheet(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Check if any data is in the sheet
  var lastRow = sheet.getLastRow();
  var existingData = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues() : [];

  var keyColumnIndex = 0; // Assuming the key is in the first column
  var statusIndex = 2; // Assuming status is in the third column
  var resolvedDateIndex = 4; // Assuming resolved date is in the fifth column

  // Create a map to store existing data keys for efficient lookup
  var existingKeysMap = {};
  for (var i = 0; i < existingData.length; i++) {
    existingKeysMap[existingData[i][keyColumnIndex]] = i; // Store the index by key
  }

  // Iterate through the processed data
  for (var i = 0; i < data.length; i++) {
    var issue = data[i];
    var key = issue[keyColumnIndex];

    if (!(key in existingKeysMap)) {
      // Key does not exist, insert new row at the top
      sheet.insertRowBefore(2);
      sheet.getRange(2, 1, 1, issue.length).setValues([issue]);

      // Update the map with the new key
      existingKeysMap[key] = 0; // New key is inserted at index 0
    } else {
      // Key exists, check if the status or resolved date has changed
      var keyIndex = existingKeysMap[key];
      var existingRow = existingData[keyIndex];

      if (
        existingRow[statusIndex] !== issue[statusIndex] ||
        existingRow[resolvedDateIndex] !== issue[resolvedDateIndex]
      ) {
        sheet.getRange(keyIndex + 2, statusIndex + 1).setValue(issue[statusIndex]); // Update status
        sheet.getRange(keyIndex + 2, resolvedDateIndex + 1).setValue(issue[resolvedDateIndex]); // Update resolved date
      }
    }
  }
}