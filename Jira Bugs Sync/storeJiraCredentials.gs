function storeJiraCredentials() {
  // Storing multiple properties at once with setProperties
  // Make sure to replace the placeholders below with the real values when setting up.

  PropertiesService.getScriptProperties().setProperties({
    "JIRA_BASE_URL": "https://your-domain.atlassian.net/", 
    "JIRA_USERNAME": "your-username@attlassian.com", // Enter your actual Jira username here
    "JIRA_API_TOKEN": "your-jira-api-token" // Enter your actual Jira API token here
  });
}