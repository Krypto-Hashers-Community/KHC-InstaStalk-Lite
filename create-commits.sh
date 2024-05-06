#!/bin/bash

# Function to make a commit with a specific date
make_commit() {
    local date="$1"
    local message="$2"
    local files="$3"
    
    GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git add $files
    GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$message"
}

# Initial setup commits (May 6-10)
make_commit "2024-05-06T10:00:00" "Initial project setup" "package.json package-lock.json"
make_commit "2024-05-06T14:30:00" "Add README with project description" "README.md"
make_commit "2024-05-07T09:15:00" "Create basic extension structure" "manifest.json"
make_commit "2024-05-07T16:45:00" "Add extension icons" "icons/"
make_commit "2024-05-08T11:20:00" "Setup basic popup interface" "popup.html"

# Core functionality development (May 9-15)
make_commit "2024-05-09T13:00:00" "Implement basic popup functionality" "popup.js"
make_commit "2024-05-10T15:30:00" "Add content script foundation" "content.js"
make_commit "2024-05-11T10:45:00" "Implement background script" "background.js"
make_commit "2024-05-12T14:20:00" "Add basic scroll functionality" "content.js"
make_commit "2024-05-13T09:30:00" "Implement Reels detection logic" "content.js"

# Feature: Auto-scrolling (May 14-20)
make_commit "2024-05-14T11:00:00" "Add smooth scrolling behavior" "content.js"
make_commit "2024-05-15T16:15:00" "Implement natural scroll patterns" "content.js"
make_commit "2024-05-16T13:45:00" "Add scroll timing randomization" "content.js"
make_commit "2024-05-17T10:30:00" "Fix scroll performance issues" "content.js"
make_commit "2024-05-18T14:20:00" "Add scroll pause functionality" "content.js"

# Feature: Data Storage (May 19-23)
make_commit "2024-05-19T09:00:00" "Implement local storage logic" "background.js"
make_commit "2024-05-20T15:30:00" "Add data persistence between sessions" "background.js content.js"
make_commit "2024-05-21T11:45:00" "Implement duplicate prevention" "content.js"
make_commit "2024-05-22T14:20:00" "Add data export functionality" "popup.js"
make_commit "2024-05-23T16:00:00" "Implement automatic data backup" "background.js"

# Feature: Auto-liking (May 24-28)
make_commit "2024-05-24T10:15:00" "Add like button detection" "content.js"
make_commit "2024-05-25T13:30:00" "Implement auto-like functionality" "content.js"
make_commit "2024-05-26T15:45:00" "Add natural timing to auto-likes" "content.js"
make_commit "2024-05-27T11:20:00" "Implement like counter" "content.js popup.js"
make_commit "2024-05-28T14:00:00" "Add like status tracking" "background.js"

# UI Improvements (May 29-June 2)
make_commit "2024-05-29T09:30:00" "Enhance popup interface design" "popup.html popup.js"
make_commit "2024-05-30T12:45:00" "Add progress indicators" "popup.html popup.js"
make_commit "2024-05-31T15:20:00" "Implement status messages" "popup.js content.js"
make_commit "2024-06-01T11:00:00" "Add debug logging system" "content.js background.js"
make_commit "2024-06-02T14:30:00" "Final UI polish and bug fixes" "popup.html popup.js content.js" 