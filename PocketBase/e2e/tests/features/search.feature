Feature: Search users

  Background:
    Given I am on the dashboard page

  Scenario: Successfully search users with a matching email
    When I search with a full matching email
    Then only the matching user should appear in the table
    And the request should be sent successfully
    And the search input should be empty

  Scenario: Successfully search with half of the matching text
    When I search with a partial email
    Then multiple matching users should appear in the table
    And the search input should be empty

  Scenario: Successfully search with unmatched text
    When I search with an unmatched keyword
    Then no user should appear and the "No records found." message is shown
    And the search input should be empty

  Scenario: Successfully clear filters when clicking the clear button
    When I search with an unmatched keyword
    And I click the clear filters button
    Then all users should reappear in the table
