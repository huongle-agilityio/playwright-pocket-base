Feature: Edit user

  Background:
    Given I am on the dashboard page

  Scenario: Successfully update the user with selected email
    Given I saw the user in the table
    When I select the user to edit
    And updates the email field with a new email and click "Save" button
    Then edit user successfully toast is shown
    And the response return has new email
    And I can see the user is updated with the new email

  Scenario: Successfully update the user and continue editing
    Given I saw the user in the table
    When I select the user to edit
    And updates the email field with a new email and click "Save and continue" button
    Then edit user successfully toast is shown
    And the edit form is still open

  Scenario: Failure update if the email already exists
    Given I saw the user in the table
    When I select the user to edit
    And updates the email field with an existing email and click "Save" button
    Then the toast show error "Value must be unique."
    And the response is bad request with error message "Failed to update record."
    And the email error message is shown on the form
