# Git Hooks Setup

This directory contains Git hooks that run automatically before commits.

## Pre-commit Hook

The pre-commit hook (`pre-commit`) automatically runs:

1. **TypeScript compilation check** (`npm run lint:ts`)
2. **ESLint** (`npm run lint`)

If any of these checks fail, the commit will be blocked.

## Usage

The hooks run automatically when you try to commit:

```bash
git add .
git commit -m "feat: add new feature"
```

The pre-commit hook will:
- ✅ Check TypeScript compilation
- ✅ Run ESLint
- ✅ Allow commit if all checks pass
- ❌ Block commit if any checks fail

## Bypassing Hooks (Not Recommended)

If you absolutely need to bypass the hooks:

```bash
git commit --no-verify -m "feat: bypass hooks"
```

## Troubleshooting

### Hook not running
Make sure the hook is executable:
```bash
chmod +x .husky/pre-commit
```

### Hook permissions
If you get permission errors, run:
```bash
git config core.hooksPath .husky
```

## Benefits

- **Code Quality**: Ensures all code meets standards
- **Type Safety**: Prevents TypeScript errors
- **Consistency**: Maintains code style
- **CI/CD**: Reduces failed builds

## Adding New Hooks

To add new pre-commit checks, edit `.husky/pre-commit`:

```bash
echo "🔍 Running new check..."
npm run new-check || exit 1
```
