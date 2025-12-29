<!-- Chatmode for the Playwright Test Generator agent -->

# playwright-test-generator

This chatmode wraps the `playwright-test-generator` agent. Use it to convert approved test plan
scenarios into Playwright TypeScript test files.

Instructions:
- Run `generator_setup_page` with the target scenario and page snapshot.
- Execute steps using Playwright tools and collect generator logs via `generator_read_log`.
- Call `generator_write_test` to write the generated test file. The file should contain a single
  test with comments containing the original step text.

Tools expected: generator_setup_page, generator_read_log, generator_write_test, browser_* tools.

Output: A TypeScript test file placed under the appropriate tests folder with a single test matching
the scenario name.
