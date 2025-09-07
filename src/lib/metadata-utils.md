# Dynamic Metadata Implementation

This document explains the dynamic metadata implementation for ByteBuzz, which provides better SEO and social sharing capabilities.

## Overview

The dynamic metadata system generates page-specific titles, descriptions, and Open Graph tags based on the content being displayed. This improves:

- **SEO**: Better search engine rankings with descriptive titles
- **Social Sharing**: Rich previews when sharing links on social platforms
- **User Experience**: More informative browser tabs and bookmarks

## Implementation

### Files Added/Modified

1. **`src/lib/metadata-utils.ts`** - Utility functions for generating metadata
2. **`src/app/(social)/[username]/page.tsx`** - User profile metadata
3. **`src/app/(social)/[username]/thread/[postId]/page.tsx`** - Post thread metadata

### Features

#### User Profile Pages (`/[username]`)

- **Dynamic Title**: `{display_name} (@{username}) | ByteBuzz`
- **Description**: User's bio or fallback message
- **Open Graph**: Profile type with user avatar
- **Twitter Cards**: Summary card with user info
- **Caching**: 1 hour revalidation

#### Post Thread Pages (`/[username]/thread/[postId]`)

- **Dynamic Title**: `Post by {author_name} | ByteBuzz`
- **Description**: First 160 characters of post content
- **Open Graph**: Article type with author info
- **Twitter Cards**: Summary card with post preview
- **Caching**: 30 minutes revalidation

### Utility Functions

#### `generateUserProfileMetadata(userProfile)`

Generates complete metadata for user profile pages including:

- Page title and description
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URL

#### `generatePostThreadMetadata(post)`

Generates complete metadata for post thread pages including:

- Page title and description
- Open Graph article tags
- Twitter Card metadata
- Published time
- Canonical URL

#### `generateFallbackMetadata(type)`

Provides fallback metadata for error cases:

- User not found
- Post not found
- Generic page not found

## Performance Considerations

### Caching Strategy

- **User Profiles**: 1 hour cache (`revalidate = 3600`)
- **Post Threads**: 30 minutes cache (`revalidate = 1800`)
- **No Additional DB Queries**: Reuses existing data fetching functions

### Error Handling

- Graceful fallbacks to static metadata
- Console error logging for debugging
- No impact on page rendering if metadata generation fails

## Testing

Run the metadata utility tests:

```bash
npm test src/lib/__tests__/metadata-utils.test.ts
```

## Usage Examples

### Testing Open Graph Tags

Use tools like:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Example URLs to Test

- User Profile: `https://yourdomain.com/johndoe`
- Post Thread: `https://yourdomain.com/johndoe/thread/post-id-123`

## Future Enhancements

Potential improvements:

1. **Dynamic OG Images**: Generate custom images for posts
2. **Structured Data**: Add JSON-LD for better search results
3. **Home Feed Metadata**: Dynamic titles based on trending content
4. **Search Page Metadata**: Dynamic titles for search results

## Maintenance

- Monitor metadata generation errors in logs
- Update fallback messages as needed
- Adjust caching times based on content update frequency
- Test social sharing regularly to ensure previews work correctly
