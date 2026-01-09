#!/usr/bin/env python3
"""
Deploy Webflow Sync Trigger to Xano via Metadata API

This script creates a database trigger on the stories table that
automatically syncs records to Webflow when created or updated.

Usage:
  python3 deploy-webflow-trigger.py <METADATA_API_TOKEN>

Alternative: Manual Setup in Xano
  1. Go to Database → stories table
  2. Click on "Triggers" tab
  3. Create "After Insert" trigger
  4. Create "After Update" trigger
  5. Copy the XanoScript from xano-triggers/story-sync-trigger.xanoscript
"""

import requests
import sys
import json

XANO_INSTANCE = "xerb-qpd6-hd8t.n7.xano.io"
METADATA_API_BASE = f"https://{XANO_INSTANCE}/api:meta"
WORKSPACE_ID = 2  # members workspace
TABLE_ID = 138    # stories table

# The trigger function code
TRIGGER_CODE = '''
// Auto-sync to Webflow on story create/update
var story $trigger.new

// Skip if missing required data
conditional $story == null || $story.story_name == null || $story.story_name == ""
  return { skipped: true }
endConditional

// Get Webflow credentials
var webflow_token $env.WEBFLOW_API_TOKEN
var webflow_collection_id $env.WEBFLOW_COLLECTION_ID

conditional $webflow_token == null || $webflow_collection_id == null
  return { error: "Webflow not configured" }
endConditional

// Build slug
var slug $story.story_name|lowercase|replace:" ":"-"|replace:"[^a-z0-9-]":""|truncate:100
var slug $slug ~ "-" ~ $story.id

// Build Webflow fields
var fields {}
var fields $fields|set:"name":$story.story_name
var fields $fields|set:"slug":$slug
var fields $fields|set:"_archived":false
var fields $fields|set:"_draft":($story.status != "published")
var fields $fields|set:"xano-id":($story.id|to_string)

// Content
conditional $story.body_html != null && $story.body_html != ""
  var fields $fields|set:"story-content":$story.body_html
endConditional

// Excerpt
conditional $story.story_input != null
  var fields $fields|set:"excerpt":$story.story_input
endConditional

// Featured image
conditional $story.uploadcare_url != null && $story.uploadcare_url != ""
  var fields $fields|set:"featured-image":{url: $story.uploadcare_url}
endConditional

// Author
conditional $story.author_name != null
  var fields $fields|set:"author-name":$story.author_name
endConditional

conditional $story.author_photo != null && $story.author_photo != ""
  var fields $fields|set:"author-image":{url: $story.author_photo}
endConditional

// Document
conditional $story.document_url != null && $story.document_url != ""
  var fields $fields|set:"document-file":{url: $story.document_url}
endConditional

// Category
conditional $story.category != null
  var fields $fields|set:"category":$story.category
endConditional

// API request
var is_update $story.webflow_item_id != null && $story.webflow_item_id != ""
var method $is_update ? "PATCH" : "POST"
var url "https://api.webflow.com/v2/collections/" ~ $webflow_collection_id ~ "/items"
conditional $is_update
  var url $url ~ "/" ~ $story.webflow_item_id
endConditional

var response external_api_request {
  url: $url,
  method: $method,
  headers: {
    "Authorization": "Bearer " ~ $webflow_token,
    "Content-Type": "application/json"
  },
  body: { fieldData: $fields }
}

var result $response.response.result

conditional $result.id != null
  var updated stories|edit:$story.id:{
    webflow_item_id: $result.id,
    webflow_synced_at: now
  }
  return { success: true, webflow_id: $result.id }
endConditional

return { success: false, error: $result }
'''


def get_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


def list_triggers(token):
    """List existing triggers on the stories table"""
    url = f"{METADATA_API_BASE}/workspace/{WORKSPACE_ID}/table/{TABLE_ID}/trigger"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code == 200:
        return response.json()
    return None


def create_trigger(token, trigger_type, name):
    """Create a trigger on the stories table"""
    url = f"{METADATA_API_BASE}/workspace/{WORKSPACE_ID}/table/{TABLE_ID}/trigger"

    body = {
        "name": name,
        "type": trigger_type,  # "after_insert" or "after_update"
        "enabled": True,
        "code": TRIGGER_CODE
    }

    response = requests.post(url, headers=get_headers(token), json=body)
    return response


def main():
    if len(sys.argv) < 2:
        print("=" * 60)
        print("Deploy Webflow Sync Trigger to Xano")
        print("=" * 60)
        print()
        print("Usage: python3 deploy-webflow-trigger.py <METADATA_API_TOKEN>")
        print()
        print("This will create two triggers on the stories table:")
        print("  1. After Insert - syncs new stories to Webflow")
        print("  2. After Update - syncs updated stories to Webflow")
        print()
        print("MANUAL ALTERNATIVE:")
        print("  1. Go to Xano → Database → stories → Triggers")
        print("  2. Create 'After Insert' trigger named 'Sync to Webflow'")
        print("  3. Create 'After Update' trigger named 'Sync to Webflow'")
        print("  4. Paste code from xano-triggers/story-sync-trigger.xanoscript")
        sys.exit(1)

    token = sys.argv[1]

    print("=" * 60)
    print("Deploying Webflow Sync Triggers to Xano")
    print("=" * 60)
    print(f"Workspace ID: {WORKSPACE_ID}")
    print(f"Table ID: {TABLE_ID} (stories)")
    print()

    # Check existing triggers
    print("Checking existing triggers...")
    triggers = list_triggers(token)
    if triggers:
        print(f"  Found {len(triggers.get('items', []))} existing trigger(s)")
        for t in triggers.get('items', []):
            print(f"    - {t.get('name')} ({t.get('type')})")
    print()

    # Create After Insert trigger
    print("Creating 'After Insert' trigger...")
    response = create_trigger(token, "after_insert", "Webflow Sync - Insert")
    if response.status_code in [200, 201]:
        print("  ✅ After Insert trigger created")
    else:
        print(f"  ❌ Failed ({response.status_code})")
        try:
            print(f"     {response.json()}")
        except:
            print(f"     {response.text[:200]}")

    # Create After Update trigger
    print("Creating 'After Update' trigger...")
    response = create_trigger(token, "after_update", "Webflow Sync - Update")
    if response.status_code in [200, 201]:
        print("  ✅ After Update trigger created")
    else:
        print(f"  ❌ Failed ({response.status_code})")
        try:
            print(f"     {response.json()}")
        except:
            print(f"     {response.text[:200]}")

    print()
    print("=" * 60)
    print("IMPORTANT: Environment Variables Required")
    print("=" * 60)
    print("Make sure these are set in Xano → Settings → Environment Variables:")
    print("  WEBFLOW_API_TOKEN = your-webflow-api-token")
    print("  WEBFLOW_COLLECTION_ID = 69546a95697458f39f126faa")
    print()
    print("Once configured, any story create/update will auto-sync to Webflow!")


if __name__ == "__main__":
    main()
