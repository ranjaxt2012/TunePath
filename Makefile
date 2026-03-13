# TunePath — Expo app targets
# Run from TunePath/ directory

.PHONY: start web ios android debug install lint lint-fix lint-ts clear tunnel help

# Default: interactive dev server (press w/i/a for web/iOS/Android)
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

# Debug: clear Metro cache and start (helps when debugging bundler issues)
debug:
	npx expo start --clear

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

# Clear Metro/Expo caches (no server start)
clear:
	rm -rf node_modules/.cache .expo/cache 2>/dev/null; echo "Cache cleared"

# Tunnel mode (for testing on physical devices outside local network)
tunnel:
	npx expo start --tunnel

help:
	@echo "TunePath — Available targets"
	@echo ""
	@echo "  make start     Start dev server (interactive, press w/i/a for platform)"
	@echo "  make web       Start and open in web browser"
	@echo "  make ios       Start and open in iOS Simulator"
	@echo "  make android   Start and open in Android emulator"
	@echo "  make debug     Start with cleared Metro cache"
	@echo "  make tunnel    Start with tunnel (for physical device testing)"
	@echo "  make install   npm install"
	@echo "  make lint      Run ESLint"
	@echo "  make lint-fix  Run ESLint with auto-fix"
	@echo "  make lint-ts   TypeScript check"
	@echo "  make clear     Clear Metro cache"
