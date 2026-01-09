#!/usr/bin/env python3
"""
Add missing columns to Xano stories table via Metadata API

Usage:
  python3 add-xano-columns.py <METADATA_API_TOKEN>

Required token scopes: Database (CRUD), Content (CRUD)
"""

import requests
import sys
import json

# Your Xano instance
XANO_INSTANCE = "xerb-qpd6-hd8t.n7.xano.io"
METADATA_API_BASE = f"https://{XANO_INSTANCE}/api:meta"

# Columns to add to the stories table
COLUMNS_TO_ADD = [
    {"name": "author_photo", "type": "text", "description": "Author profile photo URL"},
    {"name": "author_name", "type": "text", "description": "Author display name"},
    {"name": "author_bio", "type": "text", "description": "Author biography"},
    {"name": "category", "type": "text", "description": "Story category (opinion, news, feature, etc.)"},
    {"name": "status", "type": "text", "description": "Story status (draft, published)", "default": "draft"},
    {"name": "featured", "type": "bool", "description": "Is story featured", "default": False},
    {"name": "document_url", "type": "text", "description": "Document URL (Word, PPT, PDF)"},
    {"name": "webflow_item_id", "type": "text", "description": "Webflow CMS item ID"},
    {"name": "webflow_synced_at", "type": "timestamp", "description": "Last Webflow sync timestamp"},
    {"name": "published_date", "type": "timestamp", "description": "Story publish date"},
    {"name": "read_time", "type": "integer", "description": "Estimated read time in minutes"},
    {"name": "view_count", "type": "integer", "description": "View count", "default": 0},
    {"name": "updated_at", "type": "timestamp", "description": "Last update timestamp"},
    {"name": "uploadcare_uuid", "type": "text", "description": "Uploadcare file UUID"},
]


def get_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


def get_workspaces(token):
    """Get list of workspaces"""
    url = f"{METADATA_API_BASE}/workspace"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code != 200:
        print(f"Error getting workspaces: {response.status_code}")
        print(response.text)
        return None
    return response.json()


def get_tables(token, workspace_id):
    """Get list of tables in a workspace"""
    url = f"{METADATA_API_BASE}/workspace/{workspace_id}/table"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code != 200:
        print(f"Error getting tables: {response.status_code}")
        print(response.text)
        return None
    return response.json()


def get_table_schema(token, workspace_id, table_id):
    """Get schema of a table"""
    url = f"{METADATA_API_BASE}/workspace/{workspace_id}/table/{table_id}/schema"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code != 200:
        print(f"Error getting schema: {response.status_code}")
        print(response.text)
        return None
    return response.json()


def add_column(token, workspace_id, table_id, column):
    """Add a column to a table"""
    col_type = column.get("type", "text")
    url = f"{METADATA_API_BASE}/workspace/{workspace_id}/table/{table_id}/schema/type/{col_type}"

    body = {
        "name": column["name"],
        "nullable": True,
    }

    if "description" in column:
        body["description"] = column["description"]

    if "default" in column:
        body["default"] = column["default"]

    response = requests.post(url, headers=get_headers(token), json=body)
    return response


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 add-xano-columns.py <METADATA_API_TOKEN>")
        print("\nTo get your token:")
        print("1. Go to Xano → Profile → Instances")
        print("2. Click ⚙️ → Metadata API → Manage Access Tokens")
        print("3. Create new token with Database (CRUD) scope")
        sys.exit(1)

    token = sys.argv[1]

    print("=" * 60)
    print("Xano Metadata API - Add Missing Columns to Stories Table")
    print("=" * 60)

    # Get workspaces
    print("\n1. Getting workspaces...")
    workspaces = get_workspaces(token)
    if not workspaces:
        print("Failed to get workspaces. Check your token.")
        sys.exit(1)

    print(f"   Found {len(workspaces)} workspace(s)")
    for ws in workspaces:
        print(f"   - {ws.get('name', 'Unknown')} (ID: {ws.get('id')})")

    # Use first workspace (or let user choose)
    workspace_id = workspaces[0]["id"]
    print(f"\n2. Using workspace ID: {workspace_id}")

    # Get tables
    print("\n3. Getting tables...")
    tables = get_tables(token, workspace_id)
    if not tables:
        print("Failed to get tables.")
        sys.exit(1)

    # Find stories table
    stories_table = None
    for table in tables:
        print(f"   - {table.get('name')} (ID: {table.get('id')})")
        if table.get('name', '').lower() == 'stories':
            stories_table = table

    if not stories_table:
        print("\n❌ Could not find 'stories' table!")
        sys.exit(1)

    table_id = stories_table["id"]
    print(f"\n4. Found stories table (ID: {table_id})")

    # Get current schema
    print("\n5. Getting current schema...")
    schema = get_table_schema(token, workspace_id, table_id)
    if schema:
        existing_columns = [col.get("name") for col in schema]
        print(f"   Existing columns: {', '.join(existing_columns)}")
    else:
        existing_columns = []

    # Add missing columns
    print("\n6. Adding missing columns...")
    added = 0
    skipped = 0
    failed = 0

    for column in COLUMNS_TO_ADD:
        col_name = column["name"]

        if col_name in existing_columns:
            print(f"   ⏭️  {col_name} - already exists, skipping")
            skipped += 1
            continue

        response = add_column(token, workspace_id, table_id, column)

        if response.status_code in [200, 201]:
            print(f"   ✅ {col_name} ({column['type']}) - added")
            added += 1
        else:
            print(f"   ❌ {col_name} - failed: {response.status_code}")
            try:
                error = response.json()
                print(f"      Error: {error.get('message', response.text)}")
            except:
                print(f"      Error: {response.text}")
            failed += 1

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"   Added:   {added}")
    print(f"   Skipped: {skipped} (already existed)")
    print(f"   Failed:  {failed}")

    if added > 0:
        print("\n✅ Done! Your stories table now has the required columns.")
        print("   You can now submit forms with author images and documents.")
    elif failed > 0:
        print("\n⚠️  Some columns failed to add. Check your token permissions.")
    else:
        print("\n✅ All columns already exist!")


if __name__ == "__main__":
    main()
