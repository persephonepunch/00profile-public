# SDK Database Methods

Complete database operations for queries, CRUD, joins, aggregations, and transactions.

## Table of Contents
- [Basic CRUD](#basic-crud)
- [Bulk Operations](#bulk-operations)
- [Specialized Queries](#specialized-queries)
- [Advanced Queries](#advanced-queries)
- [Schema & Administration](#schema--administration)

---

## Basic CRUD

**9 core database methods** for standard CRUD operations.

| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| `dbSetDatasource(value)` | value:string | this | Set database datasource |
| `dbGet(table,filters,alias)` | table:string, filters:DatabaseFilter, alias:string | this | Get single record by filter |
| `dbGetByMultipleFields(table,filters,alias)` | table:string, filters:DatabaseFilter, alias:string | this | Get by multiple field conditions |
| `dbQuery(table,options?,alias?)` | table:string, options?:QueryOptions, alias?:string | this | Query with filters/sorting/paging/addons |
| `dbAdd(table,data,alias)` | table:string, data:Record\|string, alias:string | this | Add new record |
| `dbEdit(table,filters,data,alias)` | table:string, filters:DatabaseFilter, data:Record\|string, alias:string | this | Edit existing record |
| `dbInsert(table,data,alias)` | table:string, data:Record\|string, alias:string | this | Alias for `.dbAdd()` |
| `dbUpdate(table,filters,data,alias)` | table:string, filters:DatabaseFilter, data:Record\|string, alias:string | this | Alias for `.dbEdit()` |
| `dbDelete(table,filters,alias?)` | table:string, filters:DatabaseFilter, alias?:string | this | Delete record(s) |

### Examples

```json
{
  "operations": [
    {"method": "dbGet", "args": ["users", {"id": "$input.user_id"}, "user"]},

    {"method": "dbQuery", "args": ["users", {
      "filters": {"status": "$input.status"},
      "sort": [{"field": "created_at", "direction": "desc"}],
      "offset": 0,
      "limit": 20
    }, "users"]},

    {"method": "dbAdd", "args": ["users", {
      "name": "$input.name",
      "email": "$input.email"
    }, "new_user"]},

    {"method": "dbEdit", "args": ["users",
      {"id": "$input.user_id"},
      {"name": "$input.name"},
      "updated_user"
    ]},

    {"method": "dbDelete", "args": ["users", {"id": "$input.user_id"}]}
  ]
}
```

### dbQuery Options

The `dbQuery` method accepts a comprehensive options object with **95%+ feature completeness**:

```typescript
{
  // Filtering
  "filters": {"field": "value"},              // Object filters (auto-converts to where)
  "where": "$db.table.field == value",        // Direct where clause

  // Joins (Bind)
  "joins": [{
    "table": "related_table",                 // Table to join
    "as": "alias",                            // Alias for joined table
    "on": "$db.main.id == $db.related.foreign_key"  // Join condition
  }],

  // Computed Fields
  "eval": {
    "computed_field": "$db.table.field1 ~ $db.table.field2",
    "calculated": "$db.joined.value|filter"
  },

  // Sorting
  "sort": [{"field": "created_at", "direction": "desc"}],

  // Pagination (Multiple Options)
  "page": 1,                                  // Page number
  "per_page": 20,                             // Items per page
  "offset": 0,                                // Or use offset/limit
  "limit": 20,
  "totals": true,                             // Include totals
  "metadata": true,                           // Include pagination metadata

  // Field Selection
  "output": ["id", "name", "email"],          // Select specific fields

  // Related Data (Addons)
  "addons": [{
    "name": "addon_name",                     // Addon identifier
    "input": {"field": "$output.id"},         // Filter condition
    "as": "result_field"                      // Field name in results
  }]
}
```

**Examples:**

```json
{
  "operations": [
    {"comment": "Basic query with filters and sorting"},
    {"method": "dbQuery", "args": ["users", {
      "filters": {"status": "active"},
      "sort": [{"field": "created_at", "direction": "desc"}],
      "limit": 10
    }, "active_users"]},

    {"comment": "Query with joins"},
    {"method": "dbQuery", "args": ["users", {
      "joins": [{
        "table": "profiles",
        "as": "profile",
        "on": "$db.users.id == $db.profiles.user_id"
      }],
      "output": ["id", "name", "email", "profile.*"]
    }, "users_with_profiles"]},

    {"comment": "Query with computed fields (eval)"},
    {"method": "dbQuery", "args": ["users", {
      "eval": {
        "full_name": "$db.users.first_name ~ ' ' ~ $db.users.last_name",
        "age": "2025 - $db.users.birth_year"
      },
      "output": ["id", "full_name", "email", "age"]
    }, "users_computed"]},

    {"comment": "Query with addons (pre-defined related data)"},
    {"method": "dbQuery", "args": ["users", {
      "filters": {"id": "$input.user_id"},
      "addons": [{
        "name": "user_orders",
        "input": {"user_id": "$output.id"},
        "as": "orders"
      }]
    }, "user_with_orders"]},

    {"comment": "Complete advanced query with ALL features"},
    {"method": "dbQuery", "args": ["users", {
      "where": "$db.users.status == \"active\"",
      "joins": [{
        "table": "profiles",
        "as": "profile",
        "on": "$db.users.id == $db.profiles.user_id"
      }],
      "eval": {
        "full_name": "$db.users.first_name ~ ' ' ~ $db.users.last_name",
        "bio": "$db.profile.bio"
      },
      "output": ["id", "full_name", "email", "bio"],
      "sort": [{"field": "created_at", "order": "desc"}],
      "page": 1,
      "per_page": 20,
      "totals": true,
      "metadata": true
    }, "users_complete"]}
  ]
}
```

---

## Bulk Operations

**4 methods** for operating on multiple records at once.

| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| `dbBulkAdd(table,items,options?,alias?)` | table:string, items:any[], options?:{allowIdField?:boolean}, alias?:string | this | Add multiple records |
| `dbBulkUpdate(table,items,alias?)` | table:string, items:any[], alias?:string | this | Update multiple records |
| `dbBulkPatch(table,items,alias?)` | table:string, items:any[], alias?:string | this | Patch multiple records |
| `dbBulkDelete(table,search,alias?)` | table:string, searchCondition:string\|DatabaseFilter, alias?:string | this | Delete multiple records |

### Examples

```json
{
  "operations": [
    {"method": "dbBulkAdd", "args": ["user", "$input.users", {}, "created_users"]},
    {"method": "dbBulkUpdate", "args": ["user", "$updated_users", "results"]},
    {"method": "dbBulkDelete", "args": ["user", "status == \"inactive\"", "deleted_count"]}
  ]
}
```

---

## Specialized Queries

**11 methods** for specific query operations.

| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| `dbPatch(table,filters,data,alias)` | table:string, filters:DatabaseFilter, data:Record, alias:string | this | Partial update (only provided fields) |
| `dbAddOrEdit(table,filters,data,alias)` | table:string, filters:DatabaseFilter, data:Record, alias:string | this | Upsert operation |
| `dbHas(table,filters,alias)` | table:string, filters:DatabaseFilter, alias:string | this | Check if record exists |
| `dbCount(table,filters?,alias?)` | table:string, filters?:DatabaseFilter, alias?:string | this | Count matching records |
| `dbQueryCount(table,search?,alias?)` | table:string, searchOrOptions?:string\|any, alias?:string | this | Count with query options |
| `dbQueryExists(table,search,alias?)` | table:string, search:string, alias?:string | this | Check if query returns results |
| `dbQuerySum(table,options,alias?)` | table:string, options:any, alias?:string | this | Sum field values |
| `dbQueryAggregate(table,config,alias?)` | table:string, aggregateConfig:any, alias?:string | this | Aggregate query (min/max/avg) |
| `dbQuerySingle(table,search?,alias?)` | table:string, search?:string, alias?:string | this | Query single record |
| `dbQueryList(table,search?,alias?)` | table:string, search?:string, alias?:string | this | Query list of records |
| `dbQueryStream(table,search?,alias?)` | table:string, search?:string, alias?:string | this | Stream large result sets |

### Examples

```json
{
  "operations": [
    {"method": "dbPatch", "args": ["user", {"id": "$input.user_id"}, {"last_login": "$timestamp"}, "user"]},
    {"method": "dbAddOrEdit", "args": ["user", {"email": "$input.email"}, {"name": "$input.name", "email": "$input.email"}, "user"]},
    {"method": "dbHas", "args": ["user", {"email": "$input.email"}, "exists"]},
    {"method": "dbCount", "args": ["user", {"status": "active"}, "count"]},
    {"method": "dbQuerySum", "args": ["orders", {"field": "total", "filters": {"status": "completed"}}, "sum"]}
  ]
}
```

---

## Advanced Queries

**6 methods** for complex query operations.

| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| `dbAdvancedQuery(options)` | options:AdvancedQueryOptions | this | Complex query with all options |
| `dbQueryWithJoins(table,search?,joins?,alias?)` | table:string, search?:string, joins?:JoinConfig, alias?:string | this | Query with table joins |
| `dbQueryWithSorting(table,search?,sorting?,returnType?,alias?)` | table:string, search?:string, sorting?:SortingConfig[], returnType?:'single'\|'list', alias?:string | this | Query with sorting |
| `dbQueryWithPaging(table,search?,paging?,alias?)` | table:string, search?:string, paging?:PagingConfig, alias?:string | this | Query with pagination |
| `dbQueryWithExternalPaging(table,search?,externalPaging?,alias?)` | table:string, search?:string, externalPaging?:ExternalPagingConfig, alias?:string | this | Query with external paging params |
| `dbQueryWithOutput(table,search?,output?,returnType?,alias?)` | table:string, search?:string, output?:string[], returnType?:'single'\|'list', alias?:string | this | Query specific fields only |

### Examples

```json
{
  "operations": [
    {"method": "dbQueryWithJoins", "args": ["user", "status == \"active\"", [{"table": "profile", "alias": "profile", "type": "left", "on": "user.id = profile.user_id"}], "users"]},
    {"method": "dbQueryWithSorting", "args": ["user", "", [{"field": "created_at", "direction": "desc"}], "list", "users"]},
    {"method": "dbQueryWithPaging", "args": ["user", "status == \"active\"", {"page": "$input.page", "per_page": 20}, "users"]},
    {"method": "dbQueryWithOutput", "args": ["user", "", ["id", "name", "email"], "list", "users"]}
  ]
}
```

---

## Schema & Administration

**3 methods** for schema management and administration.

| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| `dbSchema(tableName,path?,alias?)` | tableName:string, path?:string, alias?:string | this | Get table schema |
| `dbTruncate(tableName,reset?)` | tableName:string, reset?:boolean | this | Clear table data |
| `dbTransaction(callback)` | callback:(builder:IFluentBuilder)=>void | this | Atomic transaction block |

### Examples

```json
{
  "operations": [
    {"method": "dbSchema", "args": ["user", "", "schema"]},
    {"method": "dbTruncate", "args": ["temp_table", true]},
    {"method": "comment", "args": ["Transaction: Transactions use sequential operations"]},
    {"method": "dbAdd", "args": ["order", {"user_id": 1, "total": 100}, "order"]},
    {"method": "dbEdit", "args": ["user", {"id": 1}, {"balance": "$user.balance - 100"}, "user"]}
  ]
}
```

---

## Common Patterns

### Basic Query Pattern

```json
{
  "operations": [
    {"method": "dbQuery", "args": ["user", {"search": "status == \"active\"", "page": 1, "per_page": 20}, "users"]},
    {"method": "response", "args": [{"users": "$users"}]}
  ]
}
```

### Create with Relationship

```json
{
  "operations": [
    {"method": "dbAdd", "args": ["user", {"name": "$input.name", "email": "$input.email"}, "user"]},
    {"method": "dbAdd", "args": ["profile", {"user_id": "$user.id", "bio": "$input.bio"}, "profile"]},
    {"method": "response", "args": [{"user": "$user", "profile": "$profile"}]}
  ]
}
```

### Conditional Update

```json
{
  "operations": [
    {"method": "dbGet", "args": ["user", {"id": "$input.user_id"}, "user"]},
    {"method": "conditional", "args": ["$user.status == \"active\""]},
    {"method": "dbEdit", "args": ["user", {"id": "$input.user_id"}, {"last_active": "$timestamp"}, "updated"]},
    {"method": "endConditional"},
    {"method": "response", "args": [{"user": "$updated"}]}
  ]
}
```

---

**Total Methods in this File: 33**

For workflow guidance, see [workflow.md](workflow.md)
For advanced patterns, see [examples.md](examples.md)
