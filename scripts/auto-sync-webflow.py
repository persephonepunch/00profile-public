#!/usr/bin/env python3
"""
Auto-sync Xano stories to Webflow

This script syncs all unsynced stories from Xano to Webflow.
Run it periodically (cron) or after form submissions.

Usage:
  python3 auto-sync-webflow.py

Set up as a cron job to run every 5 minutes:
  */5 * * * * cd /path/to/project && python3 scripts/auto-sync-webflow.py >> sync.log 2>&1
"""

import requests
import re
from datetime import datetime

# Configuration - uses environment variables if available, otherwise defaults
import os
XANO_API = os.getenv("XANO_API", "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu")
WEBFLOW_TOKEN = os.getenv("WEBFLOW_TOKEN", "b76b1ed9a61bd9d51f75f06c5d2c4e213cbb5c3de1d7fd372f8d604337f65606")
WEBFLOW_COLLECTION = os.getenv("WEBFLOW_COLLECTION", "69546a95697458f39f126faa")


def make_slug(name, story_id):
    """Create a valid Webflow slug"""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    slug = re.sub(r'^[^a-zA-Z0-9]+', '', slug)
    if not slug:
        slug = "story"
    return f"{slug}-{story_id}"


def sync_story(story):
    """Sync a single story to Webflow"""
    name = story.get('story_name') or 'Untitled Story'
    slug = make_slug(name, story['id'])

    fields = {
        "name": name,
        "slug": slug,
        "_archived": False,
        "_draft": story.get('status') != 'published',
        "xano-id": str(story['id']),
    }

    # Optional fields
    if story.get('story_input'):
        fields["excerpt"] = story['story_input']
    if story.get('body_html') or story.get('story_content_html'):
        fields["story-content"] = story.get('body_html') or story.get('story_content_html')
    if story.get('uploadcare_url'):
        fields["featured-image"] = {"url": story['uploadcare_url']}
    if story.get('author_photo'):
        fields["author-image"] = {"url": story['author_photo']}
    if story.get('author_name'):
        fields["author-name"] = story['author_name']
    if story.get('category'):
        fields["category"] = story['category']

    # Check if update or create
    existing_id = story.get('webflow_item_id')

    if existing_id:
        # Update existing
        resp = requests.patch(
            f"https://api.webflow.com/v2/collections/{WEBFLOW_COLLECTION}/items/{existing_id}",
            headers={"Authorization": f"Bearer {WEBFLOW_TOKEN}", "Content-Type": "application/json"},
            json={"fieldData": fields}
        )
    else:
        # Create new
        resp = requests.post(
            f"https://api.webflow.com/v2/collections/{WEBFLOW_COLLECTION}/items",
            headers={"Authorization": f"Bearer {WEBFLOW_TOKEN}", "Content-Type": "application/json"},
            json={"fieldData": fields}
        )

    result = resp.json()

    if result.get('id'):
        # Update Xano with webflow_item_id
        requests.patch(
            f"{XANO_API}/stories/{story['id']}",
            json={"webflow_item_id": result['id']}
        )
        return True, result['id']
    else:
        return False, result.get('message', 'Unknown error')


def main():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n[{timestamp}] Starting Webflow sync...")

    # Get all stories
    stories = requests.get(f"{XANO_API}/stories").json()

    # Find unsynced stories
    unsynced = [s for s in stories if not s.get('webflow_item_id')]

    if not unsynced:
        print(f"[{timestamp}] No unsynced stories found.")
        return

    print(f"[{timestamp}] Found {len(unsynced)} unsynced stories")

    synced = 0
    failed = 0

    for story in unsynced:
        success, result = sync_story(story)
        name = (story.get('story_name') or 'Untitled')[:30]

        if success:
            print(f"  ✅ {story['id']}: {name} → {result}")
            synced += 1
        else:
            print(f"  ❌ {story['id']}: {name} - {result[:50]}")
            failed += 1

    print(f"[{timestamp}] Done: {synced} synced, {failed} failed")


if __name__ == "__main__":
    main()
