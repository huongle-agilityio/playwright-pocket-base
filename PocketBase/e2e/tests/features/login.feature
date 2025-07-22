@noStorage
Feature: Login

  Background:
    Given I am on the login page

  Scenario: Success with valid inputs
    When I submit the login form with correct credentials
    Then I should receive a valid token and correct email in response
    And the dashboard is loaded

  Scenario Outline: Failure with invalid "<field>"
    When I submit the login form with invalid "<field>" input
    Then the toast with the message "Invalid login credentials." appears
    And the response should contain message "Failed to authenticate."

    Examples:
      | field     |
      | username  |
      | password  |

   Scenario: With empty inputs
    When I submit the login form with empty inputs
    Then the email input should be invalid
