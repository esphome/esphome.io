# ESPHome Documentation AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality.

## 1. Project Overview & Purpose

*   **Primary Goal:** ESPHome is a system to configure microcontrollers (like ESP32, ESP8266, RP2040, and LibreTiny-based chips) using simple yet powerful YAML configuration files. It generates C++ firmware that can be compiled and flashed to these devices, allowing users to control them remotely through home automation systems. This repo contains the primary documentation for users of ESPHome.
*   **Business Domain:** Internet of Things (IoT), Home Automation.

## 2. Core Technologies & Stack

*   **Languages:** HTML, CSS, Markdown, Go Templates
*   **Frameworks & Runtimes:** Hugo
*   **Key Libraries/Dependencies:**
    *   **Hugo:** For building the static site.
    *   **Pagefind:** For client-side text searching

## 3. Architectural Patterns

*   **Directory Structure Philosophy:**
    See the README.md file.

## 4 Branches

*   **Current**
    The `current` branch represents the published documentation in sync with the latest ESPHome release. PRs may be raised against this where they contain documentation revisions only.
*   **Next**
    The `next` branch is where changes are made via PR corresponding to new features in the ESPHome code repo (esphome/esphome). When a release is made this branch is merged into current.

## 6. Development & Testing Workflow
    See the README.md file

## 7. Specific Instructions for AI Collaboration

*   **Contribution Workflow (Pull Request Process):**
    1.  **Fork & Branch:** Create a new branch in your fork against the appropriate base branch (`current` or `next`.
    2.  **Make Changes:** Adhere to all coding conventions and patterns.
    3.  **Test:** Use the `make live-html` command to invoke hugo in server mode for instant preview.
    5.  **Commit:** Commit your changes. There is no strict format for commit messages.
    6.  **Pull Request:** Submit a PR against the `next` branch. The Pull Request title should have a prefix of the component being worked on (e.g., `[display] Add new examples`, `[abc123] Add new component`). Pull requests should always be made with the PULL_REQUEST_TEMPLATE.md template filled out correctly.

## 8. Guidelines for AI generated reviews and PR summaries

* Avoid the use of flowery language and weasel-words that add no useful content; confine comments to accurate technical descriptions - you are not writing a press release.
  For example instead of "Created comprehensive documentation with configuration examples and setup instructions" it is sufficient to say "Created documentation with examples and instructions".


