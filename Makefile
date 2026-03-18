# TunePath — Expo app targets
# Run from TunePath/ directory

EAS := ~/.npm-global/bin/eas

# ─── Branch sync ───────────────────────────────────────────

sync-to-testing:
	git checkout testing
	git merge development --no-ff -X ours
	git checkout testing -- package.json package-lock.json app.json
	@echo "✅ Code synced development → testing, versions preserved"

sync-to-main:
	git checkout main
	git merge testing --no-ff -X ours
	git checkout main -- package.json package-lock.json app.json
	@echo "✅ Code synced testing → main, versions preserved"

# ─── EAS Cloud Builds ──────────────────────────────────────

build-testing:
	git checkout testing
	$(EAS) build --platform ios --profile development

build-production:
	git checkout main
	$(EAS) build --platform ios --profile production

build-status:
	$(EAS) build:list

# ─── Sync + Build in one shot ──────────────────────────────

sync-and-build:
	$(MAKE) sync-to-testing
	$(MAKE) build-testing
	@echo "✅ Synced and build submitted"

# ─── Health checks ─────────────────────────────────────────

health:
	npx expo-doctor
	npx tsc --noEmit

# ─── Local development ─────────────────────────────────────

.PHONY: start web ios android debug dev-debug install lint lint-fix lint-ts clear tunnel ios-log android-log health build-testing build-production build-status sync-to-testing sync-to-main sync-and-build dev help

# Default: interactive dev server (press w/i/a for web/iOS/Android)
dev:
	npx expo start --clear

start:
	npx expo start

# Web browser
web:
	npx expo start --web

# iOS Simulator (requires Xcode + Simulator)
ios:
	npx expo start --ios

# Android emulator (requires Android Studio + emulator running)
android:
	npx expo start --android

# Debug: clear Metro cache and start
debug:
	npx expo start --clear

# Watch only player/engine logs
dev-debug:
	@mkdir -p logs
	npx expo start --clear 2>&1 | tee logs/player.log

# Install dependencies
install:
	npm install

# Run ESLint
lint:
	npm run lint

# Run ESLint with auto-fix
lint-fix:
	npm run lint:fix

# TypeScript check (no emit)
lint-ts:
	npm run lint:ts

# Clear Metro/Expo caches
clear:
	rm -rf node_modules/.cache .expo/cache 2>/dev/null; echo "Cache cleared"

# Tunnel mode
tunnel:
	npx expo start --tunnel

# iOS with logs piped to file
ios-log:
	@mkdir -p logs
	npx expo start --ios 2>&1 | tee logs/expo-ios.log

# Android with logs piped to file
android-log:
	@mkdir -p logs
	npx expo start --android 2>&1 | tee logs/expo-android.log

# ─── Help ──────────────────────────────────────────────────

help:
	@echo "TunePath — Available targets"
	@echo ""
	@echo "  BRANCH SYNC"
	@echo "  make sync-to-testing   Merge dev → testing (keeps testing versions)"
	@echo "  make sync-to-main      Merge testing → main (keeps main versions)"
	@echo ""
	@echo "  EAS BUILDS"
	@echo "  make build-testing     EAS build from testing branch (dev profile)"
	@echo "  make build-production  EAS build from main branch (production)"
	@echo "  make build-status      Show all EAS builds"
	@echo "  make sync-and-build    Sync to testing + submit build in one shot"
	@echo ""
	@echo "  HEALTH"
	@echo "  make health            expo-doctor + TypeScript check"
	@echo ""
	@echo "  LOCAL DEV"
	@echo "  make dev               Start with cleared cache (recommended)"
	@echo "  make start             Start dev server"
	@echo "  make web               Open in web browser"
	@echo "  make ios               Open in iOS Simulator"
	@echo "  make android           Open in Android emulator"
	@echo "  make tunnel            Start with tunnel (physical device)"
	@echo "  make install           npm install"
	@echo "  make lint              Run ESLint"
	@echo "  make lint-fix          ESLint with auto-fix"
	@echo "  make lint-ts           TypeScript check only"
	@echo "  make clear             Clear Metro cache"
	@echo "  make ios-log           iOS + save logs/expo-ios.log"
	@echo "  make android-log       Android + save logs/expo-android.log"