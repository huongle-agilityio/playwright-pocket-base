Feature: Sort users

  Scenario: Sort table by <column> in descending order
    Given the mock data is prepared for column "<column>"
    When I click the "<column>" column header
    Then the request should be sent with sort param "<sortParam>"
    And the response data should match the sorted "<column>" values
    And the table should be sorted by "<column>" in descending order

  Examples:
    | column          | sortParam         |
    | id              | -id               |
    | email           | -email            |
    | emailVisibility | -emailVisibility  |
    | username        | -username         |
    | name            | -name             |
    | website         | -website          |
