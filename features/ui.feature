Feature: User Interface
  Background:
    Given I navigate to http://100.113.214.55:5173
    And the app loads successfully

  Scenario: Dashboard displays service cards
    When I view the Dashboard
    Then I should see service cards for Photos, Documents, Search, Monitoring, Settings
    And each card should have a title and description

  Scenario: Configure API credentials in Settings
    When I navigate to Settings
    And I enter the Immich API key
    And I enter the Paperless API token
    And I enter the Meilisearch master key
    And I click Save buttons
    Then success message should appear
    And service status should show "✓ Connected" for each service

  Scenario: Photos page loads after configuration
    Given API credentials are configured
    When I navigate to Photos
    Then page should display "Photos" heading
    And photos should load and display count
    And pagination controls should be visible
    And each photo should have thumbnail image

  Scenario: Photos page shows 0 photos when not configured
    When credentials are not configured
    And I navigate to Photos
    Then page should display "Photos" heading
    And photo count should show "0 photos"
    And I should see message "Please configure Immich API key in settings"
    And no photo thumbnails should be displayed
    And pagination controls should not be visible

  Scenario: Documents page loads after configuration
    Given API credentials are configured
    When I navigate to Documents
    Then page should display "Documents" heading
    And document count should show 3463
    And search bar should be visible
    And document list should display items

  Scenario: Search functionality works
    Given API credentials are configured
    When I navigate to Search
    And I enter "test" in search box
    And I click Search button
    Then results should appear
    And each result should have title, description, and date
    And results should include documents and photos

  Scenario: Theme switching works
    When I click the theme switcher button
    Then theme should cycle through System → Light → Dark
    And theme preference should be persisted
    And UI colors should update accordingly

  Scenario: Sidebar navigation toggles
    When I click the menu button
    Then sidebar should toggle visibility
    And current page should be highlighted
    And clicking a menu item should navigate to that page

  Scenario: Error handling for unconfigured services
    When credentials are not configured
    And I navigate to Photos
    Then I should see message "Please configure Immich API key in settings"
    When I navigate to Documents
    Then I should see message "Please configure Paperless API token in settings"
    When I navigate to Search
    Then I should see message "Meilisearch key not configured"

  Scenario: Service health status indicator
    Given I am in Settings
    When I configure valid credentials
    Then each service should show connection status:
      | Service      | Status         |
      | Immich       | ✓ Connected    |
      | Paperless    | ✓ Connected    |
      | Meilisearch  | ✓ Connected    |
    When I configure invalid credentials
    Then services should show error status with HTTP error codes

  Scenario: Documents page shows 0 documents when not configured
    When credentials are not configured
    And I navigate to Documents
    Then page should display "Documents" heading
    And I should see message "Please configure Paperless API token in settings"
    And document count should show "0 documents"
    And document list should be empty

  Scenario: End-to-end credential configuration flow
    When I navigate to http://100.113.214.55:5173
    And the app loads successfully
    Then page should display "Dashboard" heading

    When I navigate to Settings
    And I enter the Immich API key
    And I enter the Paperless API token
    And I enter the Meilisearch master key
    And I click Save buttons
    Then success message should appear
    And service status should show "✓ Connected" for each service

    When I navigate to Photos
    Then page should display "Photos" heading
    And photos should load and display count

    When I navigate to Documents
    Then page should display "Documents" heading
    And document list should display items

    When I navigate to Search
    Then page should display "Search" heading
    And search bar should be visible
