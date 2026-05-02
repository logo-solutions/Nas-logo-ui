Feature: API Integration
  Background:
    Given API credentials are valid
    And services are running on 100.113.214.55

  Scenario: Immich API returns photos
    When I fetch photos from Immich
    Then I should receive 14 photos
    And each photo has required fields (id, fileName, fileCreatedAt)
    And Immich API should respond with HTTP 200

  Scenario: Paperless API returns documents
    When I fetch documents from Paperless
    Then I should receive 3463 documents
    And each document has required fields (id, title, created)
    And Paperless API should respond with HTTP 200

  Scenario: Meilisearch API is healthy
    When I check Meilisearch health
    Then Meilisearch should respond with HTTP 200
    And I should be able to search for "test"
    And search results should return documents

  Scenario: Immich thumbnail endpoint works
    When I fetch a photo thumbnail
    Then thumbnail should respond with HTTP 200
    And response should have image content-type

  Scenario: Invalid API credentials are rejected
    When I try to fetch photos with invalid key
    Then API should respond with HTTP 401 or 403
    And error message should indicate authentication failure
