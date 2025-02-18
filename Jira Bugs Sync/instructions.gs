/*
Jira Bugs Sync (Google Sheets & Jira)

---OVERVIEW---
This script syncs Jira bugs into a Google Sheet.

---SETUP INSTRUCTIONS---
1. Open Google Sheets & Apps Script
- Open a new or existing Google Sheet.
- Navigate to Extensions > Apps Script.

2. Add the Script
- Replace the default script content with the jiraBugsSyncCode.gs from this repo.
- Create two more new script files and replace the default script with the rest of the script from this repo.
- Set up properties in storeJiraCredentials.gs and replace the properties with your credentials.

3. Save and Run the Script
- In the Apps Script editor, select the save.
- Go back to the spreadsheet and click on the new custom menu "Jira Sync Menu".
- Select Input JQL Query, paste your query, and run.

---TROUBLESHOOTING---
Ensure your Jira API token has the correct permissions.
Verify that your JQL query is correct by testing it in Jira's advanced search.

---NOTES---
Data will be written to the active sheet unless modified in the script.
Enjoy bug tracking with Google Sheets & Jira!
*/






