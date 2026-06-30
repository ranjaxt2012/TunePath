# TunePath — Expo app targets
# Run from TunePath/ directory

# Resolve eas from PATH (Homebrew, npm-global, etc.); override with `make EAS=/path/to/eas ...`
EAS := $(shell command -v eas || echo eas)

# Absolute project dir (used by --local builds + .ipa install targets)
TUNEPATH_DIR := /Users/anupsingh/repo/TunePathWorkdir/TunePath

# Public API the installed/tester build talks to (overrides the LAN IP in .env.local)
API_URL := https://api.tune-path.com

# ─── Registered test devices ──────────────────────────────────────────────────
# Add each tester's UDID here. Device must already be in the Apple Dev account
# (register with `eas device:create`). Get a connected device's UDID: make list-devices
# ──────────────────────────────────────────────────────────────────────────────
# Anup's iPhone 16 Pro Max (verify via `make list-devices`)
DEVICE_anup  := A4C9A7B2-7649-5583-8655-6771A2662B8F
# DEVICE_simmi := <udid>   # add more testers here, then include in ALL_DEVICES
# DEVICE_ipad  := <udid>

# Devices targeted by `make install-all`
ALL_DEVICES  := $(DEVICE_anup)
# Default single-device install target
DEVICE_UDID  := $(DEVICE_anup)

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

.PHONY: start web ios android debug dev-debug install lint lint-fix lint-ts clear tunnel ios-log android-log health build-testing build-production build-status sync-to-testing sync-to-main sync-and-build dev help \
        local prod install-local install-all ship register-device list-devices _show-latest-ipa

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
	npx expo start --clear 2>&1 | \
	tee logs/player.log | \
	grep --line-buffered -E \
	"AUTH|API|PLAYER|NAV|STORE|ERROR|warn"

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

# ─── Local IPA builds (Ad Hoc — direct install, no App Store) ─────────────────
# `make local`  → builds a preview .ipa on this Mac (build-*.ipa in project dir)
# `make install-local` / `make install-all` → push it onto registered iPhones
# EXPO_PUBLIC_API_URL is forced to the public API so testers reach the backend
# from anywhere; Clerk + other EXPO_PUBLIC_* come from .env.local.

local:
	@echo ""
	@echo "  Building preview .ipa locally (Ad Hoc → direct install)..."
	@echo "  API target: $(API_URL)  |  ~15 min. Then: make install-local"
	@echo ""
	cd $(TUNEPATH_DIR) && \
	  set -a; [ -f .env.local ] && . ./.env.local; set +a; \
	  export EXPO_PUBLIC_API_URL=$(API_URL); \
	  $(EAS) build --platform ios --profile preview --local --non-interactive
	@$(MAKE) _show-latest-ipa

prod:
	@echo ""
	@echo "  Building production .ipa locally (App Store / TestFlight)..."
	@echo "  API target: $(API_URL)  |  ~10-15 min."
	@echo ""
	cd $(TUNEPATH_DIR) && \
	  set -a; [ -f .env.local ] && . ./.env.local; set +a; \
	  export EXPO_PUBLIC_API_URL=$(API_URL); \
	  $(EAS) build --platform ios --profile production --local --non-interactive
	@$(MAKE) _show-latest-ipa

# ─── Install latest .ipa on device(s) ─────────────────────────────────────────
# Plug the iPhone in via USB (or WiFi-paired) and unlock it first.
install-local:
	@echo ""
	@LATEST=$$(ls -t $(TUNEPATH_DIR)/build-*.ipa 2>/dev/null | head -1); \
	if [ -z "$$LATEST" ]; then echo "  No .ipa found. Run 'make local' first."; exit 1; fi; \
	echo "  Installing: $$LATEST"; echo "  On device:  $(DEVICE_UDID)"; echo ""; \
	xcrun devicectl device install app --device $(DEVICE_UDID) "$$LATEST" \
	  && echo "  ✓ TunePath installed on your iPhone." \
	  || echo "  ✗ Install failed. Is the iPhone plugged in and unlocked?"
	@echo ""

install-all:
	@echo ""
	@LATEST=$$(ls -t $(TUNEPATH_DIR)/build-*.ipa 2>/dev/null | head -1); \
	if [ -z "$$LATEST" ]; then echo "  No .ipa found. Run 'make local' first."; exit 1; fi; \
	echo "  Installing: $$LATEST"; echo ""; \
	for udid in $(ALL_DEVICES); do \
	  echo "  → $$udid ..."; \
	  xcrun devicectl device install app --device $$udid "$$LATEST" \
	    && echo "    ✓ Done" || echo "    ✗ Failed — plugged in and unlocked?"; \
	  echo ""; \
	done
	@echo "  All done."
	@echo ""

# ─── Ship: build production + submit to TestFlight in one step ────────────────
ship: prod
	@echo ""
	@echo "  Submitting to TestFlight..."
	@echo ""
	@LATEST=$$(ls -t $(TUNEPATH_DIR)/build-*.ipa 2>/dev/null | head -1); \
	if [ -z "$$LATEST" ]; then echo "  Build failed — no .ipa found."; exit 1; fi; \
	echo "  Submitting: $$LATEST"; \
	cd $(TUNEPATH_DIR) && $(EAS) submit --platform ios --path "$$LATEST"
	@echo ""
	@echo "  ✓ Shipped. Apple processes in 5-15 min; testers get a TestFlight notification."
	@echo ""

# ─── Devices ──────────────────────────────────────────────────────────────────
register-device:
	$(EAS) device:create

list-devices:
	@echo ""
	@echo "  Connected devices:"
	@echo "  ──────────────────────────────────────────────────"
	@xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" | awk '{print "  " $$0}' \
	  || echo "  No devices found. Plug in via USB."
	@echo ""

# ─── Internal helper ──────────────────────────────────────────────────────────
_show-latest-ipa:
	@LATEST=$$(ls -t $(TUNEPATH_DIR)/build-*.ipa 2>/dev/null | head -1); \
	if [ -n "$$LATEST" ]; then \
	  echo "  Build complete: $$LATEST ($$(du -h "$$LATEST" | cut -f1))"; \
	  echo "  Next: make install-local"; \
	fi

# ─── Help ──────────────────────────────────────────────────

help:
	@echo "TunePath — Available targets"
	@echo ""
	@echo "  BRANCH SYNC"
	@echo "  make sync-to-testing   Merge dev → testing (keeps testing versions)"
	@echo "  make sync-to-main      Merge testing → main (keeps main versions)"
	@echo ""
	@echo "  LOCAL IPA BUILDS (Ad Hoc — direct install)"
	@echo "  make local             Build preview .ipa on this Mac (testers, public API)"
	@echo "  make prod              Build production .ipa (App Store / TestFlight)"
	@echo "  make install-local     Install latest .ipa on your iPhone (USB)"
	@echo "  make install-all       Install latest .ipa on all registered devices"
	@echo "  make ship              Build production + submit to TestFlight"
	@echo ""
	@echo "  DEVICES"
	@echo "  make register-device   Register a tester's iPhone (eas device:create)"
	@echo "  make list-devices      Show connected iPhones/iPads + UDIDs"
	@echo ""
	@echo "  EAS CLOUD BUILDS"
	@echo "  make build-testing     EAS cloud build from testing branch (dev profile)"
	@echo "  make build-production  EAS cloud build from main branch (production)"
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