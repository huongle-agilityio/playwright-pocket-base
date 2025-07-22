@setup
@skipSetup
Feature: Authenticated with normal user

  Scenario: I log in as a user and save auth state
    Given I am on the login page
    When I log in with valid credentials
    Then I should be redirected to the dashboard
    And I save the current auth state
