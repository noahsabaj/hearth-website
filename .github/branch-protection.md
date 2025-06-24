# Branch Protection Rules Configuration

This document outlines the recommended branch protection rules for the Hearth Engine website repository.

## Main Branch Protection

Configure the following settings for the `main` branch:

### Required Status Checks
- **Require status checks to pass before merging**: ✅ Enabled
- **Require branches to be up to date before merging**: ✅ Enabled

#### Required Checks
- `setup`
- `quality`
- `unit-tests (16)`
- `unit-tests (18)`
- `unit-tests (20)`
- `e2e-tests (chrome)`
- `e2e-tests (firefox)`
- `e2e-tests (edge)`
- `accessibility`
- `performance`
- `security`
- `test-summary`

### Pull Request Requirements
- **Require pull request reviews before merging**: ✅ Enabled
  - **Required approving reviews**: 1 (adjust based on team size)
  - **Dismiss stale reviews when new commits are pushed**: ✅ Enabled
  - **Require review from code owners**: ✅ Enabled (if CODEOWNERS file exists)
  - **Restrict reviews to users with write access**: ✅ Enabled

### Additional Restrictions
- **Restrict pushes that create files larger than 100MB**: ✅ Enabled
- **Require signed commits**: ⚠️ Optional (recommended for security)
- **Require linear history**: ⚠️ Optional (team preference)
- **Allow force pushes**: ❌ Disabled
- **Allow deletions**: ❌ Disabled

### Administrator Enforcement
- **Do not allow bypassing the above settings**: ✅ Enabled
- **Include administrators**: ✅ Enabled

## Develop Branch Protection (if used)

Configure similar settings for the `develop` branch:

### Required Status Checks
- **Require status checks to pass before merging**: ✅ Enabled
- **Require branches to be up to date before merging**: ✅ Enabled

#### Required Checks
- `setup`
- `quality`
- `unit-tests (18)` (single Node version for develop)
- `e2e-tests (chrome)` (single browser for develop)
- `accessibility`

### Pull Request Requirements
- **Require pull request reviews before merging**: ✅ Enabled
  - **Required approving reviews**: 1
  - **Dismiss stale reviews when new commits are pushed**: ✅ Enabled

## GitHub CLI Commands

You can set up these branch protection rules using the GitHub CLI:

```bash
# Main branch protection
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{
    "strict": true,
    "contexts": [
      "setup",
      "quality", 
      "unit-tests (16)",
      "unit-tests (18)",
      "unit-tests (20)",
      "e2e-tests (chrome)",
      "e2e-tests (firefox)",
      "e2e-tests (edge)",
      "accessibility",
      "performance",
      "security",
      "test-summary"
    ]
  }' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "restrict_review_users": true
  }' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

# Develop branch protection (if used)
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{
    "strict": true,
    "contexts": [
      "setup",
      "quality",
      "unit-tests (18)",
      "e2e-tests (chrome)",
      "accessibility"
    ]
  }' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  }' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Environment-Specific Rules

### Feature Branches
- No special protection required
- Will be deleted after merge

### Release Branches
- Similar to main branch protection
- May allow specific maintainers to bypass some checks for hotfixes

### Hotfix Branches
- Expedited review process
- May allow direct merge to main with post-merge testing

## Auto-Merge Configuration

Consider enabling auto-merge for PRs that meet criteria:

```yaml
# .github/auto-merge.yml (if using auto-merge app)
rules:
  - name: Automatically merge passing PRs
    conditions:
      - base: main
      - status: success
      - reviews:
          required: 1
          approved: true
      - label: "auto-merge"
    actions:
      merge:
        method: squash
```

## Quality Gate Metrics

The following metrics must be met for PRs to be merged:

### Test Coverage
- Overall coverage: ≥ 90%
- New code coverage: ≥ 95%
- No decrease in coverage allowed

### Performance
- Lighthouse Performance: ≥ 80
- Bundle size increase: ≤ 10%
- Core Web Vitals: Within acceptable thresholds

### Accessibility
- Lighthouse Accessibility: ≥ 95
- No new accessibility violations
- axe-core compliance: 100%

### Security
- No high or critical security vulnerabilities
- Dependency audit: Pass
- No secrets in code

### Code Quality
- ESLint: No errors, max 5 warnings
- TypeScript: No type errors
- Prettier: Properly formatted
- No TODO/FIXME comments in main branch

## Notification Settings

Configure notifications for:
- Failed required checks
- Security vulnerabilities
- Large bundle size increases
- Performance regressions

## Branch Protection Automation

Consider using GitHub Apps or Actions to:
- Auto-update branch protection rules
- Sync rules across repositories
- Monitor rule compliance
- Generate compliance reports

## Emergency Procedures

### Breaking the Glass
In case of emergencies:

1. **Hotfix Process**:
   - Create hotfix branch from main
   - Make minimal necessary changes
   - Get expedited review
   - Merge with reduced checks if necessary
   - Follow up with full testing

2. **Admin Override**:
   - Document reason for override
   - Get approval from tech lead
   - Create incident ticket
   - Schedule post-merge verification

### Recovery Plan
If protected branch is compromised:
1. Immediately disable problematic code
2. Revert to last known good state
3. Investigate root cause
4. Implement additional safeguards
5. Update protection rules as needed

## Monitoring and Reporting

Set up monitoring for:
- Branch protection rule violations
- Bypass attempts and approvals
- Test failure rates
- Security scan results
- Performance metrics trends

Generate weekly reports on:
- Code quality metrics
- Test coverage trends
- Security posture
- Performance benchmarks
- Deployment success rates

---

**Note**: Adjust these settings based on your team size, workflow, and requirements. Start with stricter rules and relax them if they become impediments to productivity.