// Fetch stories from Webflow CMS API
require('dotenv').config();

module.exports = async function() {
  const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
  const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID;

  if (!WEBFLOW_API_TOKEN || !WEBFLOW_COLLECTION_ID) {
    console.warn('⚠️ Webflow API credentials not found in .env');
    return [];
  }

  try {
    // Fetch all items (paginate if needed)
    let allItems = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`❌ Webflow API error: ${response.status} ${response.statusText}`);
        break;
      }

      const data = await response.json();
      const items = data.items || [];
      allItems = allItems.concat(items);

      // Check if there are more items
      hasMore = items.length === limit;
      offset += limit;
    }

    // Helper to extract first image from HTML content
    function extractFirstImage(html) {
      if (!html) return null;
      // Match img tags or iframe embeds
      const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) return imgMatch[1];
      return null;
    }

    // Map Webflow items to our format
    const stories = allItems
      .filter(item => !item.isDraft && !item.isArchived) // Only published items
      .map(item => {
        const body = item.fieldData?.['story-content'] || '';
        const webflowFeaturedImage = item.fieldData?.['featured-image'];

        // Use Webflow featured image, or extract first image from content
        let featuredImage = null;
        if (webflowFeaturedImage?.url) {
          featuredImage = webflowFeaturedImage.url;
        } else if (webflowFeaturedImage) {
          featuredImage = webflowFeaturedImage;
        } else {
          // Extract first image from body content as fallback
          featuredImage = extractFirstImage(body);
        }

        return {
          id: item.id,
          slug: item.fieldData?.slug || item.id,
          title: item.fieldData?.name || 'Untitled',
          excerpt: item.fieldData?.excerpt || '',
          body: body,
          authorName: item.fieldData?.['author-name'] || '',
          authorImage: item.fieldData?.['author-image']?.url || item.fieldData?.['author-image'] || null,
          xanoId: item.fieldData?.['xano-id'] || '',
          category: item.fieldData?.category || '',
          publishedOn: item.lastPublished || item.createdOn,
          createdOn: item.createdOn,
          updatedOn: item.lastUpdated,
          featuredImage: featuredImage,
        };
      });

    console.log(`✅ Fetched ${stories.length} published stories from Webflow`);
    return stories;

  } catch (error) {
    console.error('❌ Error fetching from Webflow:', error.message);
    return [];
  }
};
