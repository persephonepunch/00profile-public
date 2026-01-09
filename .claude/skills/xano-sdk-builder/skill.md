---
name: xano-sdk-builder
description: "Expert XanoScript SDK development with iterative BUILD->EXPOSE->TEST->LEARN->REPEAT workflows. Use when building Xano API endpoints, creating functions, background tasks, triggers, middleware, or any of the 11 Xano primitive types. Includes critical patterns for response extraction, timeout handling, error diagnosis, and 95%+ first-submission success patterns. Keywords: Xano, XanoScript, SDK, endpoint, function, task, trigger, middleware, API integration, MCP, xano-mcp, timeout, response extraction."
---

# Xano SDK Builder

Expert iterative development skill for building robust Xano backends using the XanoScript SDK.

---

## Purpose

Build Xano primitives (endpoints, functions, tasks, triggers, middleware, etc.) using XanoScript SDK with the Xano MCP tool. This skill ensures 95%+ first-submission success through incremental development, proper testing, and battle-tested patterns.

**Why read this documentation:** XanoScript has specific syntax (`id` not `$authToken`, `now` not `$now`, filters for time math) and an incremental workflow that prevents multi-error failures. Start with [workflow.md](resources/workflow.md), reference [production-patterns.md](resources/production-patterns.md) for auth/errors/testing, and [xanoscript-filters.md](resources/xanoscript-filters.md) for the 200+ available filters.

---

## When to Use This Skill

Automatically activates when working on:
- Creating or updating Xano API endpoints
- Building Xano functions or background tasks
- Creating database triggers or middleware
- Integrating external APIs (Stripe, SendGrid, OpenAI, etc.)
- Handling API timeouts and errors
- Debugging XanoScript validation errors
- Building RAG systems or complex workflows
- Using the xano-mcp MCP tool

**Not sure if this is the right skill?** If you're working with Xano code or the xano-mcp tool, this is the right skill.

---

## 🎯 THE PRIMARY METHOD: sdk_builder Tool

### Core Workflow

**The modern, recommended workflow uses the `sdk_builder` MCP tool:**

1. **Generate XanoScript** - Use `sdk_builder` tool with structured operations
2. **Deploy** - Use `create_*` tool with generated XanoScript
3. **Test** - curl test immediately to verify
4. **Iterate** - Repeat for each feature addition

---

## Understanding Xano Primitive Types

**The `sdk_builder` tool generates 11 different types of Xano primitives.**

### What's a Primitive Type?

Think of primitives as "containers" for your XanoScript logic. **The SAME operations work in ALL primitives** — only the wrapper syntax and deployment method change.

### Currently Supported (3 types) ✅

| Type | Purpose | When to Use | Deploy With |
|------|---------|-------------|-------------|
| `"endpoint"` | HTTP API routes | REST APIs, webhooks, data fetching | `create_endpoint` / `update_endpoint` |
| `"function"` | Reusable logic | Shared calculations, utilities, helpers | `create_function` |
| `"task"` | Scheduled jobs | Daily cleanup, reports, batch processing | `create_task` / `update_task` |

### Coming Soon (8 types) 📋

| Type | Purpose |
|------|---------|
| `"trigger"` | Database event handlers (on insert/update/delete) |
| `"middleware"` | Request/response processing (auth, logging, validation) |
| `"addon"` | Reusable query components (attach to db.query) |
| `"test"` | Unit tests for endpoints |
| `"workflow_test"` | Integration tests (multi-step flows) |
| `"agent"` | AI agents with LLM integration |
| `"ai_tool"` | Tools callable by AI agents |
| `"mcp_server"` | External MCP tool integrations |

### 🎯 The Unified Architecture

**CRITICAL INSIGHT:** All 11 primitive types use the SAME operations in their `stack` block.

**Example: Same logic, three different primitives**

**As an Endpoint (HTTP API):**
```json
{
  "type": "endpoint",
  "name": "/cleanup-logs",
  "method": "POST",
  "operations": [
    {"method": "dbQuery", "args": ["logs", {"filters": {"created_at": {"<": "$now - 604800"}}}, "old_logs"]},
    {"method": "dbBulkDelete", "args": ["logs", "$old_logs"]},
    {"method": "response", "args": [{"deleted": "$old_logs|count"}]}
  ]
}
```

**As a Task (Scheduled Background Job):**
```json
{
  "type": "task",
  "name": "daily_cleanup",
  "operations": [
    {"method": "schedule", "args": ["0 0 * * *"]},
    {"method": "dbQuery", "args": ["logs", {"filters": {"created_at": {"<": "$now - 604800"}}}, "old_logs"]},
    {"method": "dbBulkDelete", "args": ["logs", "$old_logs"]}
  ]
}
```

**As a Function (Reusable Logic):**
```json
{
  "type": "function",
  "name": "cleanup_old_records",
  "operations": [
    {"method": "param", "args": ["table_name", "text"]},
    {"method": "param", "args": ["days_old", "integer"]},
    {"method": "dbQuery", "args": ["$table_name", {"filters": {"created_at": {"<": "$now - ($days_old * 86400)"}}}, "old_records"]},
    {"method": "dbBulkDelete", "args": ["$table_name", "$old_records"]},
    {"method": "return", "args": [{"deleted": "$old_records|count"}]}
  ]
}
```

**Notice:** The core operations (`dbQuery`, `dbBulkDelete`) are IDENTICAL. Only the wrapper (`type`, metadata like `schedule` or `param`) changes.

### What This Means for You

✅ **Learn once, apply everywhere** — Master operations now, use them in all 11 primitives
✅ **Same patterns** — Incremental workflow works for ALL primitive types
✅ **Future-proof** — When new primitive types are added, you already know how to use them

**For now:** Focus on endpoints, functions, and tasks. The other 8 types will work the same way when implemented.

---

## 🚨 CRITICAL: BUILD INCREMENTALLY (The #1 Success Factor)

**This is the most important concept in this entire skill. Everything else is secondary.**

### The Incremental Workflow

**First Deployment (MINIMAL):**
1. Create primitive with ONLY:
   - Input validation (for endpoints)
   - ONE simple operation
   - Basic response/return
2. Deploy it
3. Test with curl
4. Read the actual response
5. ✅ **STOP** - Do not add more yet

**Second Deployment (ADD ONE FEATURE):**
1. Use `update_*` tool (NOT create!)
2. Use `sdk_builder` with ONE more operation added
3. Deploy the update
4. Test with curl
5. ✅ **STOP** - Do not add more yet

**Third+ Deployments (ONE FEATURE AT A TIME):**
1. UPDATE (never recreate)
2. Add ONE feature
3. Deploy with `sdk_builder` → `update_*`
4. Test
5. REPEAT until complete

### Why This Matters

✅ **Fix 1 error instead of 10** - Errors teach you the correct syntax
✅ **95%+ success rate** - Proven pattern from 6+ months production use
✅ **Build confidence incrementally** - Each success builds on the last
✅ **Learn from errors** - SDK error messages show you the right syntax

**NEVER:**
- ❌ Build complete solution first
- ❌ Create test-v2, test-v3 endpoints
- ❌ Skip testing between changes
- ❌ Add multiple features before testing

---

## ⚠️ MANDATORY: Read Before Starting

**BEFORE writing ANY code, you MUST use the Read tool to read these files:**

### STEP 1 - Read the Workflow (REQUIRED)

```
Read tool: /Users/sboulos/.claude/skills/xano-sdk-builder/resources/workflow.md
```

This teaches you the **BUILD → TEST → UPDATE → REPEAT** incremental workflow. This is THE most critical file.

### STEP 2 - Read the Methods You Need

**Creating endpoints:**
- `resources/sdk-methods-core.md` — Input, variables, response
- `resources/sdk-methods-database.md` — Database queries

**Making API calls:**
- `resources/sdk-methods-api.md` — External API requests
- `resources/error-responses.md` — Handling errors

**Advanced features:**
- `resources/sdk-methods-control-flow.md` — Conditionals, loops
- `resources/sdk-methods-security.md` — Auth, JWT, encryption

### STEP 3 - Read Limitations (REQUIRED)

```
Read tool: /Users/sboulos/.claude/skills/xano-sdk-builder/resources/what-breaks.md
```

This shows what DOESN'T work and critical workarounds.

**⚠️ DO NOT skip reading these files. DO NOT just reference them. ACTIVELY READ THEM with the Read tool.**

---

## Quick Start: Your First Endpoint

**Follow this exact order for your first endpoint:**

### Phase 1: Setup (One-Time)

```bash
# Get your instance (full domain!)
mcp__snappy-mcp__execute({
  "tool_id": "list_instances"
})
# Result: "https://xnwv-v1z6-dvnr.n7c.xano.io"
```

### Phase 2: Minimal First Deployment

```json
// Use sdk_builder to generate minimal endpoint
{
  "type": "endpoint",
  "name": "greeting/hello",
  "method": "GET",
  "operations": [
    {"method": "response", "args": [{"success": true}]}
  ]
}
// Copy generated XanoScript to create_endpoint
```

### Phase 3: Test First Version

```bash
curl https://your-instance.xano.io/api:GROUP_NAME/hello
# Should return: {"success": true}
```

### Phase 4: Add ONE Feature

```json
// Use sdk_builder again with updated operations
{
  "type": "endpoint",
  "name": "greeting/hello",
  "method": "GET",
  "operations": [
    {"method": "input", "args": ["name", "text"]},  // NEW
    {"method": "response", "args": [{"message": "Hello $input.name"}]}  // UPDATED
  ]
}
// Use update_endpoint (NOT create_endpoint!) with the XanoScript
```

### Phase 5: Test Updated Version

```bash
curl "https://your-instance.xano.io/api:GROUP_CANONICAL_ID/greeting/hello?name=World"
# Should return: {"message": "Hello World"}
```

**After this:** Repeat Phase 4-5 for each new feature (database query, API call, etc.)

---

## 🧪 Curl Testing Patterns (CRITICAL)

**Always include `-H "Content-Type: application/json"` with curl or requests will fail!**

### GET Requests (Query Parameters)
```bash
# Single parameter
curl "https://instance.xano.io/api:GROUP_ID/endpoint?param=value"

# Multiple parameters
curl "https://instance.xano.io/api:GROUP_ID/endpoint?user_id=123&status=active"

# With Content-Type header (recommended)
curl -H "Content-Type: application/json" \
  "https://instance.xano.io/api:GROUP_ID/endpoint?param=value"
```

### POST Requests (JSON Body)
```bash
# ALWAYS include Content-Type header for POST
curl -X POST "https://instance.xano.io/api:GROUP_ID/endpoint" \
  -H "Content-Type: application/json" \
  -d '{"field": "value", "number": 123}'

# Multi-line for readability
curl -X POST "https://instance.xano.io/api:GROUP_ID/endpoint" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 500
  }'
```

### Authenticated Requests (JWT)
```bash
# With Bearer token
curl -X POST "https://instance.xano.io/api:GROUP_ID/protected-endpoint" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"user_id": 123}'
```

### Pretty Print JSON Response
```bash
# Using python
curl -X POST "https://instance.xano.io/api:GROUP_ID/endpoint" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}' 2>/dev/null | python3 -m json.tool

# Using jq (if installed)
curl -X POST "https://instance.xano.io/api:GROUP_ID/endpoint" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}' | jq
```

### Common curl Gotchas
❌ **Missing Content-Type** - Request will fail silently
❌ **Wrong quotes** - Use single quotes around JSON data: `'{...}'`
❌ **Forgetting -X POST** - Defaults to GET
❌ **Not suppressing curl stats** - Use `2>/dev/null` or `-s` flag

✅ **Always use this template:**
```bash
curl -X POST "https://INSTANCE.xano.io/api:GROUP_ID/ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```

---

## 🚨 Critical Gotchas (Top 5)

### 1. Preconditions Work with Runtime Variables ✅

**VERIFIED:** Preconditions CAN use runtime variables calculated in the stack!

✅ **This works perfectly:**
```json
{
  "operations": [
    {"method": "input", "args": ["amount", "integer"]},
    {"method": "var", "args": ["is_valid", "$input.amount > 0 && $input.amount < 1000"]},
    {"method": "precondition", "args": ["$is_valid", "Amount must be between 1 and 999"]}
  ]
}
```

**Test Results:**
- ✅ Valid amount (500): Returns success
- ✅ Invalid amount (1500): Returns `{"code":"ERROR_FATAL","message":"Amount must be between 1 and 999"}`
- ✅ Zero: Also fails correctly

**Use Cases:**
- Complex validation logic with multiple conditions
- Calculations before validation
- Combining multiple input checks into one variable

**Alternative:** You can still use `conditional` + `throw` for runtime checks - both patterns work!

### 2. API Response Structure

⚠️ Responses are at `$result.response.status` and `$result.response.result`

```json
{
  "operations": [
    {"method": "var", "args": ["status", "$result.response.status"]},
    {"method": "var", "args": ["body", "$result.response.result"]},
    {"method": "conditional", "args": ["$body == false"]},
    {"method": "throw", "args": ["API_TIMEOUT", "API call timed out"]},
    {"method": "endConditional"}
  ]
}
```

Check for timeout BEFORE accessing nested data.

**Why This Matters:**
- Timeouts return `false` instead of object
- Accessing `$result.response.result.field` on `false` throws error

### 3. Use 'params' Not 'body'

❌ **'body' parameter throws error:**

```json
{
  "operations": [
    {"method": "apiRequest", "args": ["url", "POST", {"body": {"field": "$value"}}, "result"]}
  ]
}
```

This fails - use 'params' instead.

✅ **Use 'params' for request body:**

```json
{
  "operations": [
    {"method": "apiRequest", "args": ["url", "POST", {"headers": {"Content-Type": "application/json"}, "params": {"field": "$value"}}, "result"]}
  ]
}
```

**Why This Matters:**
- XanoScript uses 'params' for all request data (query params, POST body, etc.)

### 4. Object Building Performance

❌ **SLOW (multiple varUpdate calls):**

```json
{
  "operations": [
    {"method": "var", "args": ["obj", "{}"]},
    {"method": "varUpdate", "args": ["obj", "$obj|set:\"a\":$val1"]},
    {"method": "varUpdate", "args": ["obj", "$obj|set:\"b\":$val2"]}
  ]
}
```

This is 600% slower than chaining.

✅ **FAST (chain filters in ONE line):**

```json
{
  "operations": [
    {"method": "var", "args": ["obj", "{}|set:\"a\":$val1|set:\"b\":$val2|set:\"c\":$val3"]}
  ]
}
```

**Why This Matters:**
- Each varUpdate is a separate operation in XanoScript
- Chaining filters is one operation, dramatically faster

### 5. UPDATE Primitives, NEVER Recreate

❌ **Wrong - creating multiple versions:**

Use `update_endpoint` to modify existing endpoints, not `create_endpoint` multiple times.

✅ **Correct workflow:**

1. First time: Use `create_endpoint` (or `create_function`, `create_task`)
2. After that: ALWAYS use `update_endpoint` (or `update_task`) with the ID

This keeps the endpoint URL stable and avoids cluttering the API group.

**Why This Matters:**
- ✅ Keeps endpoint URL stable (no broken links)
- ✅ Maintains version history
- ✅ Avoids cluttering API group with test-v2, test-v3, test-final
- ✅ Follows production best practices

**Note:** Functions CANNOT be updated - create new version with different name if changes needed.

---

## Navigation Guide

### Start Here (REQUIRED READING)

1. **[workflow.md](resources/workflow.md)** — The BUILD→TEST→UPDATE→REPEAT process ⚠️ MUST READ
2. **[what-breaks.md](resources/what-breaks.md)** — Common errors and workarounds ⚠️ MUST READ

### Then Read Based on Your Task

**Creating Endpoints:**
- [sdk-methods-core.md](resources/sdk-methods-core.md) — Input, variables, response
- [sdk-methods-database.md](resources/sdk-methods-database.md) — Queries and CRUD

**Making API Calls:**
- [sdk-methods-api.md](resources/sdk-methods-api.md) — External API requests
- [error-responses.md](resources/error-responses.md) — Handling API errors

**Adding Logic:**
- [sdk-methods-control-flow.md](resources/sdk-methods-control-flow.md) — Conditionals, loops, error handling
- [sdk-methods-data-structures.md](resources/sdk-methods-data-structures.md) — Arrays, objects, math

**Security & Auth:**
- [sdk-methods-security.md](resources/sdk-methods-security.md) — JWT, encryption, password hashing

### Advanced Features

| Need to... | Read this |
|------------|-----------|
| **String operations** | [sdk-methods-text.md](resources/sdk-methods-text.md) |
| **Redis caching** | [sdk-methods-redis.md](resources/sdk-methods-redis.md) |
| **File uploads** | [sdk-methods-storage.md](resources/sdk-methods-storage.md) |
| **Utilities & testing** | [sdk-methods-utilities.md](resources/sdk-methods-utilities.md) |
| **AI agents & MCP** ⚠️ NOT YET IN SDK | [sdk-methods-ai.md](resources/sdk-methods-ai.md) |

### Language Reference

| Need to... | Read this |
|------------|-----------|
| **XanoScript operators** | [xanoscript-operators.md](resources/xanoscript-operators.md) |
| **XanoScript filters** | [xanoscript-filters.md](resources/xanoscript-filters.md) |

### Quick Reference

| Need to... | Read this |
|------------|-----------|
| **Production patterns** | [production-patterns.md](resources/production-patterns.md) |
| **Copy working code** | [examples.md](resources/examples.md) |
| **Quick snippets** | [quick-reference.md](resources/quick-reference.md) |

---

## Common Patterns Quick Reference

### Input Validation
```json
{
  "operations": [
    {"method": "input", "args": ["email", "text"]},
    {"method": "input", "args": ["amount", "int"]},
    {"method": "precondition", "args": ["$input.email != \"\"", "Email required", 400]},
    {"method": "precondition", "args": ["$input.amount > 0", "Amount must be positive", 400]}
  ]
}
```

### Authentication (requiresAuth)
```json
{
  "operations": [
    {"method": "requiresAuth", "args": []},
    {"method": "response", "args": [{"user_id": "id"}]}
  ]
}
```
**CRITICAL**: After `requiresAuth`, use `id` (not `$id`, not `$authToken`) - it's just `id`

### Current Time (now)
```json
{
  "operations": [
    {"method": "var", "args": ["created_at", "now"]},
    {"method": "var", "args": ["expires_at", "now|add_secs_to_timestamp:2592000"]},
    {"method": "dbAdd", "args": ["subscriptions", {"started_at": "now", "expires_at": "$expires_at"}, "sub"]}
  ]
}
```
**CRITICAL**:
- Use `now` (not `$now`) - it's just `now` like `id` after auth
- Use `|add_secs_to_timestamp:seconds` filter for time calculations (can't do `now + 2592000`)
**Time intervals**: 1 hour = 3600, 1 day = 86400, 30 days = 2592000

### API Request (POST with JSON)
```json
{
  "operations": [
    {"method": "var", "args": ["request_body", "{}|set:\"field\":$value"]},
    {"method": "apiRequest", "args": ["https://api.example.com/endpoint", "POST", {"headers": {"Content-Type": "application/json", "Authorization": "Bearer $env.API_KEY"}, "params": "$request_body"}, "result"]}
  ]
}
```

### API Error Handling
```json
{
  "operations": [
    {"method": "var", "args": ["status", "$result.response.status"]},
    {"method": "var", "args": ["body", "$result.response.result"]},
    {"method": "conditional", "args": ["$body == false"]},
    {"method": "throw", "args": ["API_TIMEOUT", "API call timed out"]},
    {"method": "endConditional"},
    {"method": "conditional", "args": ["$status >= 400"]},
    {"method": "throw", "args": ["API_ERROR", "$body.error.message"]},
    {"method": "endConditional"}
  ]
}
```

### Database Query
```json
{
  "operations": [
    {"method": "dbQuery", "args": ["users", {"filters": {"status": "active", "created_at": {">": "$min_date"}}, "sort": {"created_at": "desc"}, "page": 1, "per_page": 10}, "users"]}
  ]
}
```

### Build Complex Object
```json
{
  "operations": [
    {"method": "var", "args": ["user_stats", "{}|set:\"posts\":$count|set:\"followers\":$followers"]},
    {"method": "var", "args": ["user_data", "{}|set:\"name\":$name|set:\"email\":$email|set:\"stats\":$user_stats"]},
    {"method": "response", "args": [{"success": true, "data": "$user_data"}]}
  ]
}
```

### Call Function
```json
{
  "operations": [
    {"method": "callFunction", "args": ["calculate_discount", {"amount": "$input.amount", "discount_percent": 10}, "discount_result"]}
  ]
}
```

---

## MCP Tool Discovery Pattern

**ALWAYS follow this pattern when using MCP tools:**

### Step 1: Search for Tool
```json
mcp__snappy-mcp__tool_search({ "query": "sdk builder" })
// Returns: tool_id: "sdk_builder"
```

### Step 2: Get Parameters
```json
mcp__snappy-mcp__info({ "tool_id": "sdk_builder" })
// Returns: all required/optional parameters
```

### Step 3: Execute sdk_builder
```json
mcp__snappy-mcp__execute({
  "tool_id": "sdk_builder",
  "arguments": {
    "type": "endpoint",
    "name": "/test",
    "method": "POST",
    "operations": [
      {"method": "input", "args": ["name", "text"]},
      {"method": "response", "args": [{"success": true}]}
    ]
  }
})
// Returns: XanoScript string
```

### Step 4: Deploy with create_*
Use the XanoScript from sdk_builder with appropriate tool:
- `create_endpoint` for endpoints
- `create_function` for functions
- `create_task` for tasks

Test immediately with curl.

---

## Anti-Patterns (Never Do This)

❌ Create test-v2, test-v3 endpoints (UPDATE existing ones!)
❌ Skip curl testing between changes
❌ Use short instance names ("xivz-202s") - must be full domain
❌ Guess MCP tool parameters (use info first!)
❌ Multiple varUpdate calls for object building (chain filters!)
❌ Use 'body' parameter in apiRequest (use 'params'!)
❌ Use variables in preconditions (use conditional + throw!)
❌ Try to update functions (create new version instead!)
❌ Build complete solution first (incremental only!)
❌ Add multiple features before testing

---

## Core Philosophy

**The workflow is EVERYTHING. Syntax is secondary.**

✅ Create MINIMAL primitive first
✅ Test with curl IMMEDIATELY
✅ UPDATE same primitive (never create v2)
✅ Add ONE feature per update
✅ Test after EVERY change
✅ Let errors teach you the syntax

---

## Success Metrics

When this skill is working well:
- ✅ First deployment works 95%+ of time
- ✅ curl tests pass on first try
- ✅ No "Invalid kind" or schema errors
- ✅ Fast iteration (minutes, not hours)
- ✅ Clean workspace (no test-v2, test-v3)
- ✅ Confidence building with each success

---

## Key Differences from JavaScript

| JavaScript | XanoScript |
|------------|-----------|
| `str1 + str2` | `$str1|concat:$str2` or `$str1 ~ $str2` |
| `arr.length` | `$arr|count` |
| `str.toUpperCase()` | `$str|to_upper` |
| `obj.key` | `$obj.key` (same) |
| `a * b` | `$a|multiply:$b` or `$a * $b` (both work) |

---

**Skill Status**: PRODUCTION-READY ✅
**Line Count**: 497 (under 500 limit) ✅
**Progressive Disclosure**: 18 resource files ✅
**Coverage**: 95% of XanoScript operations (166/175 methods) ✅
**Primitive Types**: 3 supported, 8 planned ✅
**Production Tested**: 6+ months, patterns from 90%+ success deployments ✅
