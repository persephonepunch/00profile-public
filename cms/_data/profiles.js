const fs = require('fs');
const path = require('path');

// Parse CSV file for profiles data
module.exports = function() {
  const csvPath = path.join(__dirname, '../../docs/usc-profiles - Profiles.csv');

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = parseCSVLine(lines[0]);

    const profiles = [];
    const seenSlugs = new Set();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = parseCSVLine(lines[i]);
      const profile = {};

      headers.forEach((header, index) => {
        profile[header.toLowerCase().replace(/ /g, '_')] = values[index] || '';
      });

      // Skip duplicates (keep only entries with story content)
      if (seenSlugs.has(profile.slug) && !profile.story) continue;
      if (seenSlugs.has(profile.slug)) {
        // Replace the existing one if this one has story content
        const existingIndex = profiles.findIndex(p => p.slug === profile.slug);
        if (existingIndex !== -1 && profile.story) {
          profiles[existingIndex] = profile;
        }
        continue;
      }

      seenSlugs.add(profile.slug);

      // Clean up the profile object
      profile.name = profile.title || '';
      profile.photo_url = profile.photo || '';
      profile.excerpt = profile.description || '';
      profile.major = profile.major || '';
      profile.story_html = profile.story || '';

      // Only include if has required fields
      if (profile.name && profile.slug) {
        profiles.push(profile);
      }
    }

    return profiles;

  } catch (error) {
    console.error('Error loading profiles CSV:', error);
    return [];
  }
};

// Helper function to parse CSV line (handles quoted fields with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
