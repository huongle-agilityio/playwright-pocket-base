@noStorage
@googleSetup
@timeout:120000
Feature: Login with Google account

  Scenario: I log in using Google account with 2FA
    Given I am on the Google login page
    When I log in using Google email and password
    And I enter the 2FA code
    Then my session should be saved
