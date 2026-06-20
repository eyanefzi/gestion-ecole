# GitHub Actions Secrets Configuration

This file documents which secrets should be configured for GitHub Actions workflows.

## Required Secrets

Add these secrets to your GitHub repository:

**Repository Settings → Secrets and variables → Actions**

### Docker Registries

```
DOCKER_USERNAME=your-docker-hub-username
DOCKER_PASSWORD=your-docker-hub-password
```

To create a Docker Hub token:
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Copy the token and use it as `DOCKER_PASSWORD`

### GitHub Container Registry (ghcr.io)

Uses `GITHUB_TOKEN` automatically (no additional secrets needed)

### SonarQube (Optional)

```
SONAR_HOST_URL=https://sonarqube.example.com
SONAR_TOKEN=your-sonarqube-token
```

To get SonarQube token:
1. Login to your SonarQube instance
2. Go to User Settings → Security
3. Generate a token under "Tokens"

## Optional Environment Variables

Add as **Repository variables** (not secrets):

```
REGISTRY_URL=ghcr.io
BUILD_TIMEOUT=600
ARTIFACT_RETENTION_DAYS=5
```

## Testing Secrets Locally

Use `act` to test workflows locally:

```bash
# Install act
brew install act

# Test with secrets
act -s DOCKER_USERNAME=your-user -s DOCKER_PASSWORD=your-pass
```

## Security Best Practices

1. ✅ Use PAT (Personal Access Tokens) for Docker Hub, not passwords
2. ✅ Rotate secrets regularly
3. ✅ Use minimal scopes for tokens
4. ✅ Never commit secrets to the repository
5. ✅ Use GitHub's secret scanning features
6. ✅ Keep `.github` directory private in access control

## Revoking Compromised Secrets

If a secret is exposed:

1. **Immediately revoke** the token/secret in the original service
2. **Delete** the secret from GitHub
3. **Create a new** secret with a different value
4. **Run workflows** again to test the new secret

## Monitoring Secret Usage

View secret usage in **Settings → Security analysis → Secret scanning**

## Example Workflow Using Secrets

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```
