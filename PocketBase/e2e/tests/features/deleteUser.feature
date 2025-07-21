Feature: Delete user

  Background:
    Given I am on the dashboard page
    And I clear the search input if needed

  Scenario: Successfully delete single user
    When I select the user by clicking checkbox
    And I click the delete button and confirm to delete the user
    Then the response status should be "No content"
    And the toast with the message "Successfully deleted the selected record." appears
    And the user row should not be visible in the table

  Scenario: Successfully delete multiple users
    When I select multiple users by clicking the checkbox
    And I click the delete button and confirm delete multiple users
    Then the response status for each deletion should be "No content"
    And the toast with the message "Successfully deleted the selected records." appears
    And the selected rows should not be visible in the table

  Scenario: Unselect user delete in the table
    When I click the checkbox to select a user
    Then I should see 1 record selected
    When I unselect the same row
    Then I should see 0 records selected (after 1 selected)

  Scenario: Unselect users using reset button
    When I select multiple users by clicking the checkbox
    Then I should see 2 records selected
    When I click the reset button
    Then I should see 0 records selected (after 2 selected)
    And all checkboxes should be unchecked
