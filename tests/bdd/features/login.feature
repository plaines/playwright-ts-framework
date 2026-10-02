Feature: Login to OrangeHRM
  As an HR administrator
  I want to log in to OrangeHRM
  So that I can manage employees

  Scenario: Administrator logs in with valid credentials
    Given I am on the OrangeHRM login page
    When I log in with valid credentials
    Then I should see the "Dashboard" page title

  Scenario: User cannot log in with a wrong password
    Given I am on the OrangeHRM login page
    When I log in as "Admin" with password "wrong-password"
    Then I should see the error message "Invalid credentials"
