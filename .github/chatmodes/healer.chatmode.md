<!-- Chatmode for the Playwright Test Healer agent -->

# playwright-test-healer

This chatmode wraps the `playwright-test-healer` agent. Use it to diagnose failing Playwright tests,
identify root causes (selectors, timing, data), apply fixes, and re-run tests until they pass.

Instructions:
- Run failing tests with `test_run` to collect failures.
- For each failure, use `test_debug` and browser snapshot/network tools to investigate.
- Apply code fixes and re-run tests iteratively until they succeed or are marked `test.fixme()`.

Tools expected: test_run, test_debug, browser_snapshot, browser_network_requests, edit, etc.

Output: Modified test files or a report explaining fixes, and a final verification run status.
