# Branch Protection Configuration

This file contains recommended GitHub branch protection rules for this project.

## Protection Rules for `master` Branch

Configure in **Settings → Branches → Add rule** for `master` pattern:

### Required Status Checks
```
✅ Backend Java CI
✅ Backend Node.js CI
✅ Frontend CI
✅ Code Quality & Security
✅ Integration Tests
```

### Other Protection Settings
```
✅ Require a pull request before merging
   └─ Require approvals: 1
   └─ Require review from code owners: false
   └─ Include administrators: true
   └─ Restrict who can push to matching branches: false

✅ Require status checks to pass before merging
   └─ Require branches to be up to date before merging: true

✅ Require signed commits: false (optional)

✅ Allow force pushes: false

✅ Allow deletions: false
```

## Protection Rules for `develop` Branch

Configure in **Settings → Branches → Add rule** for `develop` pattern:

### Required Status Checks
```
✅ Backend Java CI
✅ Backend Node.js CI
✅ Frontend CI
✅ Code Quality & Security
```

### Other Protection Settings
```
✅ Require a pull request before merging
   └─ Require approvals: 1
   └─ Require review from code owners: false
   └─ Include administrators: false

✅ Require status checks to pass before merging
   └─ Require branches to be up to date before merging: false

✅ Allow auto-merge: true
   └─ Allow auto-merge commits
   └─ Allow squash merging
   └─ Allow rebase merging
```

## GitHub Apps & Actions

### Required Permissions
In **Settings → Actions → General**:

```
✅ Allow all actions and reusable workflows
   OR
✅ Allow select actions
   ├─ actions/checkout@v4
   ├─ actions/setup-java@v3
   ├─ actions/setup-node@v3
   ├─ docker/build-push-action@v4
   ├─ docker/setup-buildx-action@v2
   ├─ docker/login-action@v2
   └─ github/codeql-action@v2
```

### Workflow Permissions
In **Settings → Actions → General**:

```
✅ Workflow permissions: Read and write permissions
✅ Allow GitHub Actions to create and approve pull requests: true
```

## Rulesets (GitHub 2024+)

Alternative to branch protection rules using Rulesets:

**Settings → Rules → New repository ruleset**

### Production Ruleset (for `master`)
```
Name: Production Protection
Enforcement: Active
Target: master branch

Rules:
  - Require status checks:
    - Backend Java CI
    - Backend Node.js CI
    - Frontend CI
    - Code Quality & Security
    - Integration Tests
  
  - Require code review before merge (1 approval)
  - Block direct pushes
  - Dismiss stale pull request approvals
  - Require branch to be up to date
  - Require signed commits (recommended)
```

### Development Ruleset (for `develop`)
```
Name: Development Protection
Enforcement: Active
Target: develop branch

Rules:
  - Require status checks:
    - Backend Java CI
    - Backend Node.js CI
    - Frontend CI
    - Code Quality & Security
  
  - Require code review before merge (1 approval)
  - Allow automatic merges
```

## Code Owners

Create `.github/CODEOWNERS` file:

```
# Global owners
* @eyanefzi

# Backend Java services
/backend/api-gateway/ @eyanefzi
/backend/config-server/ @eyanefzi
/backend/courses-service/ @eyanefzi
/backend/eureka-server/ @eyanefzi
/backend/quiz-service/ @eyanefzi
/backend/student-service/ @eyanefzi

# Backend Node.js
/backend/auth-service-node/ @eyanefzi

# Frontend
/frontend/ @eyanefzi

# Configuration
/.github/workflows/ @eyanefzi
/docker-compose.yml @eyanefzi
```

## Merge Commit Strategy

Recommended settings in **Settings → General → Pull Requests**:

```
✅ Allow merge commits
   └─ Default to PR title and description

✅ Allow squash merging
   └─ Default to PR title

✅ Allow rebase merging
   └─ No default
```

## Dismissal Settings

In branch protection rules:
```
✅ Dismiss stale pull request approvals when new commits are pushed: true

✅ Require approval of the latest reviewable commit: true
```

## Notification Settings

In **Settings → Options → Pull Requests**:
```
✅ Auto-merge pull requests: disabled
   (Use manual merge to ensure all checks pass)
```

## GitHub CLI Commands

Apply these rules using GitHub CLI:

```bash
# Create branch protection
gh api -X PUT repos/:owner/:repo/branches/master/protection \
  -f required_status_checks='{"strict":true,"contexts":["Backend Java CI","Backend Node.js CI","Frontend CI","Code Quality & Security","Integration Tests"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  -f restrictions=null

# Check current rules
gh api repos/:owner/:repo/branches/master/protection
```

## Review Requirements

Add to pull requests:
- Automated approval from workflows
- Manual review by at least 1 team member
- All conversations resolved
- All checks passing
