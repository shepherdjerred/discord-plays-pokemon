#!/bin/bash
set -e

echo "🚀 Testing Discord Plays Pokemon CI Workflow"
echo "============================================"

# Test 1: Check if dagger is working
echo "📋 Test 1: Dagger CLI availability"
dagger version
echo "✅ Dagger CLI is working"
echo ""

# Test 2: Check if functions are available
echo "📋 Test 2: Dagger functions"
dagger functions
echo "✅ All Dagger functions are available"
echo ""

# Test 3: Test individual package builds (without full CI)
echo "📋 Test 3: Individual package validation"
echo "   - Checking if packages have correct structure..."

# Check if packages exist
for pkg in common backend frontend; do
    if [ -d "packages/$pkg" ]; then
        echo "   ✅ packages/$pkg exists"
        if [ -f "packages/$pkg/package.json" ]; then
            echo "   ✅ packages/$pkg/package.json exists"
        else
            echo "   ❌ packages/$pkg/package.json missing"
        fi
    else
        echo "   ❌ packages/$pkg missing"
    fi
done

# Test 4: Check if GitHub Actions workflow exists
echo ""
echo "📋 Test 4: GitHub Actions workflow"
if [ -f ".github/workflows/ci.yml" ]; then
    echo "   ✅ GitHub Actions workflow exists"
else
    echo "   ❌ GitHub Actions workflow missing"
fi

# Test 5: Check if configuration files exist
echo ""
echo "📋 Test 5: Configuration files"
files=(
    "dagger.json"
    ".dagger/package.json"
    ".dagger/tsconfig.json"
    ".dagger/src/index.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""
echo "🎉 CI Workflow setup validation complete!"
echo ""
echo "💡 To test the full CI pipeline:"
echo "   1. Commit your changes: git add . && git commit -m 'Add Dagger CI/CD'"
echo "   2. Push to GitHub: git push origin main"
echo "   3. Check GitHub Actions tab for the workflow run"
echo ""
echo "🔧 For local testing (may take time due to large dependencies):"
echo "   dagger call ci --source=. --version=test-1.0.0 --git-sha=\$(git rev-parse HEAD) --env=dev"
