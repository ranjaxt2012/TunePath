.PHONY: sync-to-testing sync-to-main build-testing dev health

# Sync code from development → testing
# Merges all .tsx .ts files but keeps
# testing branch package versions intact
sync-to-testing:
	git checkout testing
	git merge development --no-ff \
	  -X ours \
	  -- ":(exclude)package.json" \
	  ":(exclude)package-lock.json" \
	  ":(exclude)app.json"
	@echo "✅ Code synced development → testing"

# Sync code from testing → main (after QA passes)
sync-to-main:
	git checkout main
	git merge testing --no-ff \
	  -X ours \
	  -- ":(exclude)package.json" \
	  ":(exclude)package-lock.json" \
	  ":(exclude)app.json"
	@echo "✅ Code synced testing → main"

# Build testing branch on EAS
build-testing:
	git checkout testing
	~/.npm-global/bin/eas build \
	  --platform ios \
	  --profile development

# Start dev server on current branch
dev:
	npx expo start --clear

# Run health check
health:
	npx expo-doctor
	npx tsc --noEmit
