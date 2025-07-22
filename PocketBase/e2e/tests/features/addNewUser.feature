@addNewUser
Feature: Add new user

  Background:
    Given I am on the dashboard page
    And I open the add new user form

  Scenario: Failure with empty inputs
    When I submit the user form
    Then the form title should be "New users record"

  Scenario: Leave the form while filling it
    When I fill the email field
    And I cancel the form
    Then the form should be closed

  Scenario: Successfully with filling the required inputs
    When I fill the user form with required inputs
    Then the response is successful with the created user
    And the user should appear in the table
    And the toast with the message "Successfully created record" appears

  Scenario: Successfully with filling in all the inputs
    When I fill the form with all inputs (except avatar)
    Then the user should appear in the table with all information
    And the toast with the message "Successfully created record" appears

  Scenario: Failure with no permission to upload avatar
    When I fill the form with avatar file
    Then the form title should be "New users record"
    And an error message should contain "mime type must be one of: NO_UPLOADS_ALLOWED"
    And the toast with the message "Failed to create record." appears

  Scenario Outline: Failure when input is invalid
    Given a user may already exist with "<field>" if "<preStep>"
    When I fill the form with "<field>"
    Then the response should be 400 with error message
    And the toast with the message "Failed to create record." appears
    And an error message for "<field>" should be appeared on the form
    And the user is deleted if exists

    Examples:
      | title                   | field                 | preStep |
      | short username          | invalidLengthUsername | false   |
      | invalid username format | invalidUsername       | false   |
      | invalid email format    | invalidEmail          | false   |
      | invalid ID format       | invalidId             | false   |
      | duplicate email         | emailExists           | true    |
