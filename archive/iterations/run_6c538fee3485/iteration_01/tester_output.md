# Tester Report

Nothing was run. These tests are written but not executed.

## Approach
The tests are Python unittest files. They check the backend API and content model directly (FastAPI TestClient, pydantic validation and the file repository). They also check the frontend and ops files by reading their source text.

## Test cases
- AC2 and AC1: the home endpoint returns all 8 sections, and years of experience comes from `years_since`.
- AC3 to AC6: the journey list is chronological, a journey missing a field or a reflection part fails validation, and the repository does not publish invalid files.
- AC8: an unknown project status is rejected.
- AC11: all four article kinds are accepted and an unknown kind is rejected.
- AC12: a lesson needs all 4 sections.
- AC13 and AC14: the Now page has 5 groups, and editing the file shows up on the next request without a rebuild.
- AC15 and AC16: duplicate reactions return 409 and counts update.
- AC17 to AC19: replies are threaded, tags are stripped, and length limits are enforced.
- AC21: hidden comments are not shown publicly.
- AC23 and AC24: search filters, sorting and the empty result.
- AC26, AC29 and AC30: admin endpoints return 401 or 403 for missing, expired, invalid or non-admin tokens, and passwords are hashed.
- AC28 and AC38: content is saved as Markdown with front matter, and the repository and search index follow protocols.
- AC33 and AC37: static checks for sitemap, robots, Open Graph metadata and the docker compose services.

## Findings and defects
1. AC7 and AC8: a project needs a non-empty media list, so a project without media is rejected.
2. Admin UI and the analytics dashboard UI are not implemented. Only the APIs exist, so AC25 and AC27 are met only at API level.
3. Not testable here: AC31, AC32 (responsive sizes), AC34, AC35 and the E2E and component flows. They need Lighthouse, axe and a browser.
4. AC20: the in-memory rate limiter is per process only.
5. Possible defect: sanitization strips only `<...>` tags, so a payload that lacks a closing `>` is kept as text. It is rendered as plain text by React, so it is low risk.
6. Possible defect: `delete_comment` removes replies together with the parent comment (cascade).
7. Possible defect: the journey detail page shows `lessons` through generic fields, not a dedicated section.

## Automated Test Execution

```text
E
======================================================================
ERROR: test_acceptance (unittest.loader._FailedTest.test_acceptance)
----------------------------------------------------------------------
ImportError: Failed to import test module: test_acceptance
Traceback (most recent call last):
  File "C:\actions-runner\_work\_tool\Python\3.15.0\x64\Lib\unittest\loader.py", line 433, in _find_test_path
    module = self._get_module_from_name(name)
  File "C:\actions-runner\_work\_tool\Python\3.15.0\x64\Lib\unittest\loader.py", line 374, in _get_module_from_name
    __import__(name)
    ~~~~~~~~~~^^^^^^
  File "C:\Users\LEGION\Project\iPuwadonPortfolio\iterations\run_6c538fee3485\iteration_01\tests\test_acceptance.py", line 14, in <module>
    from fastapi.testclient import TestClient
ModuleNotFoundError: No module named 'fastapi'


----------------------------------------------------------------------
Ran 1 test in 0.000s

FAILED (errors=1)
```

Exit code: 1