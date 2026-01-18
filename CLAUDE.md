# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP Google Workspace is a Model Context Protocol server that integrates Gmail and Google Calendar with Claude. It allows AI assistants to query/manage emails and calendar events across multiple Google accounts.

## Build & Development Commands

```bash
npm run build    # Compile TypeScript to dist/
npm start        # Run server with ts-node (development)
npm run dev      # Same as npm start
```

No test suite exists in this project.

## Architecture

### Entry Point
`src/server.ts` - Main `GoogleWorkspaceServer` class that:
- Initializes MCP SDK with stdio transport
- Routes tool calls to Gmail/Calendar handlers
- Manages OAuth flow via `OAuthServer` (listens on port 4100 for callbacks)

### Services
`src/services/gauth.ts` - `GAuthService` handles OAuth2:
- Reads credentials from `.gauth.json`
- Stores per-user tokens as `.oauth2.{email}.json`
- Auto-refreshes expired tokens

### Tools
Tools are organized by service, each with `getTools()` returning MCP tool definitions and `handleTool()` dispatching to implementations:

- `src/tools/gmail.ts` - 13 tools for email operations (query, read, draft, reply, archive, attachments)
- `src/tools/calendar.ts` - 7 tools for calendar operations (list, get events, create, update, delete, RSVP)

### Key Pattern
All tools except `*_list_accounts` require a `user_id` argument (email address) to specify which configured Google account to use.

## Configuration Files

- `.gauth.json` - Google OAuth2 client credentials (client_id, client_secret)
- `.accounts.json` - List of allowed Google accounts with metadata
- `.oauth2.{email}.json` - Per-user OAuth tokens (auto-generated)

## Environment Variables

- `GMAIL_ALLOW_SENDING` - Set to `true` to enable email sending tools (gmail_reply, gmail_create_draft, gmail_forward, gmail_send_email). Default is `false` for safety.

## CLI Arguments

```bash
node dist/server.js \
  --gauth-file .gauth.json \      # OAuth credentials path
  --accounts-file .accounts.json \ # Accounts config path
  --credentials-dir ./             # Where to store OAuth tokens
```
