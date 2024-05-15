Feature: Verify Sales Volumes Screen

  Background: 
    Given a Supplier is created
    Given login to BM Portal as a Supplier

  @testcase-SDEL-454
  Scenario: Verify Sales Volumes
    When a user navigates to Sales Volumes tab
    Then user sees the Sales Volumes

  @testcase-SDEL-458
  Scenario: Verify Current Month
    When a user navigates to Sales Volumes tab
    And user clicks on Current Month button
    # And user expands the Sales Row