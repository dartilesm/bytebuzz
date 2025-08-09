#!/bin/bash

# Release script for DevHub
# Usage: ./scripts/release.sh [patch|minor|major] [release-notes]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_error "Must be on main branch to create a release. Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    print_error "Working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# Check if we're up to date with remote
git fetch origin
if [ "$(git rev-list HEAD...origin/main --count)" != "0" ]; then
    print_error "Local main is not up to date with remote. Please pull latest changes."
    exit 1
fi

# Parse arguments
RELEASE_TYPE=${1:-patch}
RELEASE_NOTES=${2:-""}

# Validate release type
if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "Invalid release type. Must be patch, minor, or major."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")
print_status "Current version: $CURRENT_VERSION"

# Calculate new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

case "$RELEASE_TYPE" in
    "major")
        NEW_MAJOR=$((MAJOR + 1))
        NEW_VERSION="$NEW_MAJOR.0.0"
        ;;
    "minor")
        NEW_MINOR=$((MINOR + 1))
        NEW_VERSION="$MAJOR.$NEW_MINOR.0"
        ;;
    "patch")
        NEW_PATCH=$((PATCH + 1))
        NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
        ;;
esac

print_status "New version will be: $NEW_VERSION"

# Confirm release
echo
read -p "Are you sure you want to create release v$NEW_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Release cancelled"
    exit 0
fi

# Create release branch
RELEASE_BRANCH="release/v$NEW_VERSION"
print_status "Creating release branch: $RELEASE_BRANCH"
git checkout -b "$RELEASE_BRANCH"

# Update version in package.json
print_status "Updating package.json version"
node -e "
const pkg = require('./package.json');
pkg.version = '$NEW_VERSION';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Commit version bump
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Push release branch
print_status "Pushing release branch to remote"
git push origin "$RELEASE_BRANCH"

# Create pull request
print_status "Creating pull request for release"
gh pr create \
    --title "Release v$NEW_VERSION" \
    --body "## Release v$NEW_VERSION

$RELEASE_NOTES

### Changes
- [ ] Version bumped to $NEW_VERSION
- [ ] Ready for production deployment

### Checklist
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] UI/UX reviewed
- [ ] Performance tested
- [ ] Security reviewed" \
    --base main \
    --head "$RELEASE_BRANCH" \
    --label "release"

print_success "Release branch created and pull request opened!"
print_status "Next steps:"
echo "1. Review the pull request: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/pulls"
echo "2. Merge the PR when ready"
echo "3. The release workflow will automatically create a tag and GitHub release"
echo "4. Production deployment will trigger automatically"

# Return to main branch
git checkout main
print_status "Returned to main branch"
