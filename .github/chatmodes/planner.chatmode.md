<!-- Chatmode for the Playwright Test Planner agent -->

# playwright-test-planner

This chatmode wraps the `playwright-test-planner` agent. Use it when you need a comprehensive
manual or automated test plan for a web application. The agent explores a page snapshot, designs
test scenarios, and saves a markdown test plan.

Instructions:
- The agent will call `planner_setup_page` to set up the page snapshot.
- Explore the interface using browser tools and create detailed scenarios.
- Save the final plan using `planner_save_plan`.

Tools expected: planner_setup_page, planner_save_plan, browser_* (navigate, click, snapshot, etc.)

Quality: Produce clear, numbered steps and expected results for each scenario. Output should be
saved as a markdown file.
