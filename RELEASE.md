# Release Management Guide

This guide explains how to properly manage releases for DevHub using our automated release workflow.

## 🚀 Release Process Overview

We use a **GitHub Actions-based release workflow** that automates version bumping, tagging, and release creation. The process ensures consistency and reduces human error.

## 📋 Prerequisites

- GitHub CLI installed (`gh`)
- Access to push to main branch
- Clean working directory
- All tests passing

## 🔄 Release Workflow

### Option 1: Automated Release (Recommended)

1. **Run the release script:**

   ```bash
   # Make the script executable (first time only)
   chmod +x scripts/release.sh

   # Create a patch release
   ./scripts/release.sh patch "Bug fixes and improvements"

   # Create a minor release
   ./scripts/release.sh minor "New features added"

   # Create a major release
   ./scripts/release.sh major "Breaking changes"
   ```

2. **Review and merge the PR:**

   - The script creates a release branch and PR automatically
   - Review the changes and checklist
   - Merge when ready

3. **Automatic release creation:**
   - GitHub Actions creates a tag
   - Generates a GitHub release with changelog
   - Triggers production deployment

### Option 2: Manual Release

1. **Create release branch:**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/v1.2.0
   ```

2. **Update version:**

   ```bash
   # Edit package.json manually or use npm version
   npm version patch  # or minor, major
   ```

3. **Create and push tag:**
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin v1.2.0
   ```

## 🏷️ Semantic Versioning

We follow [Semantic Versioning](https://semver.org/) (SemVer):

- **PATCH** (0.0.X): Bug fixes, no breaking changes
- **MINOR** (0.X.0): New features, backward compatible
- **MAJOR** (X.0.0): Breaking changes, major updates

### Examples:

- `0.1.0` → `0.1.1` (patch)
- `0.1.1` → `0.2.0` (minor)
- `0.2.0` → `1.0.0` (major)

## 🔧 GitHub Actions Workflows

### Release Management (`release.yml`)

- **Triggers:** Manual workflow dispatch, tag pushes
- **Jobs:**
  - `create-release`: Creates GitHub release from tag
  - `bump-version`: Automatically bumps version and creates tag
  - `notify-release`: Provides status notifications

### Production Deployment (`db-production.yml`)

- **Triggers:** Push to main branch
- **Actions:** Runs tests, creates DB backup, deploys to production

### CI Pipeline (`ci.yml`)

- **Triggers:** Push to feature branches
- **Actions:** Runs tests, linting, database validation

## 📝 Release Checklist

Before creating a release, ensure:

- [ ] All tests are passing
- [ ] Database migrations are tested
- [ ] UI/UX has been reviewed
- [ ] Performance is acceptable
- [ ] Security review completed
- [ ] Documentation is updated
- [ ] Changelog is prepared

## 🚨 Emergency Releases

For critical fixes that need immediate deployment:

1. **Create hotfix branch:**

   ```bash
   git checkout main
   git checkout -b hotfix/critical-fix
   ```

2. **Make minimal changes and test thoroughly**

3. **Create patch release:**

   ```bash
   ./scripts/release.sh patch "Critical security fix"
   ```

4. **Fast-track the PR review and merge**

## 📊 Release Monitoring

After a release:

1. **Monitor GitHub Actions:**

   - Check workflow completion
   - Verify production deployment
   - Review logs for any errors

2. **Monitor application:**

   - Check production logs
   - Monitor error rates
   - Verify database migrations

3. **Rollback plan:**
   - Keep previous version tag for quick rollback
   - Database rollback scripts ready
   - Feature flags for gradual rollout

## 🔄 Rollback Process

If a release needs to be rolled back:

1. **Revert to previous tag:**

   ```bash
   git checkout v1.1.0  # Previous stable version
   git checkout -b hotfix/rollback-v1.2.0
   ```

2. **Update version:**

   ```bash
   npm version patch  # Creates v1.1.1
   ```

3. **Create rollback release:**
   ```bash
   ./scripts/release.sh patch "Rollback from v1.2.0 due to critical issues"
   ```

## 📚 Best Practices

1. **Never push directly to main** - always use PRs
2. **Test thoroughly** before releasing
3. **Use descriptive commit messages** for better changelog
4. **Keep releases small** and focused
5. **Document breaking changes** clearly
6. **Monitor releases** in production
7. **Have a rollback plan** ready

## 🆘 Troubleshooting

### Common Issues

**Release workflow fails:**

- Check GitHub Actions logs
- Verify secrets are configured
- Ensure proper permissions

**Version conflicts:**

- Check package.json version
- Verify git tags are correct
- Clean up any duplicate tags

**Database migration issues:**

- Check Supabase logs
- Verify migration files
- Test migrations locally first

### Getting Help

- Check GitHub Actions logs
- Review release workflow configuration
- Contact the DevOps team
- Check Supabase documentation

## 📖 Additional Resources

- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

_This guide is maintained by the DevOps team. For questions or updates, please create an issue or PR._
