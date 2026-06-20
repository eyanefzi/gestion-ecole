# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for the Gestion d'Ecole microservices application.

## Workflows Overview

### 1. Backend Java CI (`backend-java-ci.yml`)
Builds and tests all Java-based microservices:
- API Gateway
- Config Server
- Courses Service
- Eureka Server
- Quiz Service
- Student Service

**Triggers:**
- Push to `master` or `develop`
- Pull requests to `master` or `develop`
- Changes in `backend/` directory

**Steps:**
- Sets up JDK 17
- Runs Maven build
- Executes unit tests
- Uploads build artifacts
- Optional SonarQube analysis

---

### 2. Backend Node.js CI (`backend-nodejs-ci.yml`)
Builds and tests the Node.js authentication service.

**Services:**
- PostgreSQL database for migrations testing

**Triggers:**
- Changes in `backend/auth-service-node/`

**Steps:**
- Sets up Node.js 18
- Installs dependencies
- Generates Prisma Client
- Runs database migrations
- Builds TypeScript
- Runs linting (if available)
- Builds Docker image

---

### 3. Frontend CI (`frontend-ci.yml`)
Builds and tests the Angular frontend application.

**Triggers:**
- Changes in `frontend/` directory

**Steps:**
- Sets up Node.js
- Installs npm dependencies
- Lints code
- Builds Angular application (production)
- Runs unit tests
- Uploads build artifacts
- Builds Docker image

---

### 4. Code Quality & Security (`code-quality.yml`)
Scans the repository for vulnerabilities and code quality issues.

**Features:**
- Trivy filesystem vulnerability scan
- NPM audit for dependencies
- OWASP Dependency Check

**Triggers:**
- Push to `master` or `develop`
- Pull requests

---

### 5. Docker Build & Push (`docker-build.yml`)
Builds and pushes Docker images to registries.

**Registries:**
- GitHub Container Registry (ghcr.io)
- Docker Hub (optional)

**Triggers:**
- Push to `master` branch
- Changes in `backend/`, `frontend/`, or `docker-compose.yml`

**Services:**
- All Java microservices
- Auth Service (Node.js)
- Frontend (Angular)

---

### 6. Integration Tests (`integration-tests.yml`)
Runs integration tests with all required services.

**Services:**
- PostgreSQL
- MySQL
- RabbitMQ

**Triggers:**
- Push to `master` or `develop`
- Pull requests

**Steps:**
- Waits for all services to be healthy
- Builds Auth Service with database migrations
- Builds all Java services
- Runs smoke tests

---

### 7. Documentation & Format (`docs.yml`)
Checks documentation and auto-formats code.

**Features:**
- Markdown linting
- Code formatting with Prettier
- Auto-commit formatted code to `develop` branch

**Triggers:**
- Push to documentation files
- Pull requests

---

### 8. Release (`release.yml`)
Creates releases and generates changelog.

**Triggers:**
- Push of git tags: `v*.*.*` or `release-*`

**Steps:**
- Generates changelog from commits
- Creates GitHub Release
- Pushes Docker images with release tags

---

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Docker Configuration
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password

### SonarQube (Optional)
- `SONAR_HOST_URL`: SonarQube server URL
- `SONAR_TOKEN`: SonarQube authentication token

### GitHub Token
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## How to Use

### 1. Triggering Workflows

**On commit to master/develop:**
```bash
git push origin master
```
This automatically triggers:
- Backend Java CI
- Backend Node.js CI
- Frontend CI
- Code Quality scan
- Docker Build & Push (if on master)
- Integration Tests

**On pull request:**
```bash
git push origin feature-branch
git pull-request
```
This triggers:
- All CI workflows
- Code Quality scan
- Integration Tests

**On release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```
This triggers:
- Release workflow
- Creates GitHub Release
- Generates changelog

### 2. Monitoring Workflows

Go to your GitHub repository → **Actions** tab to view:
- Active workflows
- Workflow history
- Build logs
- Artifacts

### 3. Fixing Failed Workflows

1. Check the failing workflow log
2. Fix the issue locally
3. Commit and push changes
4. Workflow will automatically retry

## Environment Variables

### For Docker Builds
Set in the workflow or configure secrets:
- `DOCKER_REGISTRY`: Container registry URL
- `IMAGE_TAG`: Custom image tag

### For Tests
- `DATABASE_URL`: PostgreSQL connection string
- `JAVA_OPTS`: JVM options
- `NODE_OPTIONS`: Node.js options

## Best Practices

1. **Branch Protection**: Enable branch protection rules that require workflows to pass
2. **Artifact Retention**: Artifacts are kept for 5 days by default
3. **Caching**: Workflows use dependency caching for faster builds
4. **Security**: Keep secrets secure and rotate them regularly
5. **Notifications**: Configure workflow notifications in GitHub settings

## Troubleshooting

### Java build fails
- Check JDK version (should be 17)
- Run `mvn clean install` locally
- Check Maven cache

### Node.js build fails
- Check Node.js version (18.x)
- Run `npm ci` locally
- Verify `.env` file in auth-service-node

### Docker push fails
- Verify Docker credentials
- Check registry permissions
- Ensure docker-compose is valid

### Database migration fails
- Verify PostgreSQL is running
- Check migration files
- Run `npx prisma migrate deploy` locally

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Java Setup Action](https://github.com/actions/setup-java)
- [Node.js Setup Action](https://github.com/actions/setup-node)
