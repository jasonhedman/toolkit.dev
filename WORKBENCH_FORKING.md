# Workbench Forking Feature

## Overview

The workbench forking feature allows users to discover, view, and fork public workbenches created by other users in the community. This promotes sharing and collaboration while maintaining proper ownership and access controls.

## Features Implemented

### 🍴 Forking Functionality
- **Fork Public Workbenches**: Users can fork any public workbench to create their own copy
- **Duplicate Own Workbenches**: Users can duplicate their own workbenches (distinguished from forking)
- **Access Control**: Only public workbenches can be forked by non-owners
- **Attribution**: Forked workbenches include attribution to the original creator

### 🌐 Public Workbench Discovery
- **Public Workbenches Page**: Browse all public workbenches at `/workbench/public`
- **Search Functionality**: Search public workbenches by name and system prompt
- **Infinite Scrolling**: Paginated loading for better performance
- **Toolkit Display**: Shows which toolkits are configured in each workbench

### 🔐 Visibility Controls
- **Public/Private Settings**: Workbenches can be set as public or private
- **Default Privacy**: New workbenches are private by default
- **Forked Privacy**: Forked workbenches are always private by default
- **Visual Indicators**: Public workbenches display a "Public" badge

### 🎛️ Enhanced UI Components
- **Workbench Header Actions**: Fork/duplicate buttons with appropriate permissions
- **Sidebar Navigation**: Added "Public Workbenches" link to main navigation
- **Parameter Configuration**: Full support for toolkit parameter preservation during forking

## API Endpoints

### `forkWorkbench`
```typescript
forkWorkbench: protectedProcedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    // Creates a new workbench copy with attribution
  })
```

### `getPublicWorkbenches`
```typescript
getPublicWorkbenches: protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(10),
    cursor: z.string().nullish(),
    search: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    // Returns paginated public workbenches with search
  })
```

### `duplicateWorkbench`
```typescript
duplicateWorkbench: protectedProcedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    // Creates a copy of user's own workbench
  })
```

## Access Control Rules

### Forking Permissions
1. **Public Workbenches**: Can be forked by any authenticated user
2. **Private Workbenches**: Cannot be forked by others
3. **Own Workbenches**: Use duplicate instead of fork

### Viewing Permissions
1. **Public Workbenches**: Viewable by anyone
2. **Private Workbenches**: Only viewable by owner
3. **Chat History**: Users only see their own chats within workbenches

## Database Schema Updates

### Workbench Model
```prisma
model Workbench {
  id              String     @id @default(uuid())
  name            String
  systemPrompt    String     @db.Text
  toolkitConfigs  Json       @default("[]") // Stores toolkit IDs + parameters
  visibility      Visibility @default(private) // Public/Private setting
  userId          String
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  chats           Chat[]
}
```

## Migration Strategy

The implementation includes backward compatibility:
- Existing workbenches automatically set to "private"
- Legacy `toolkitIds` arrays converted to `toolkitConfigs` with empty parameters
- All parameter configurations preserved during forking

## User Experience

### Discovery Flow
1. Users navigate to "Public Workbenches" from sidebar
2. Browse/search available public workbenches
3. View workbench details including toolkits and author
4. Fork interesting workbenches with one click

### Forking Flow
1. Click "Fork" button on public workbench
2. Forked workbench created with attribution
3. Automatically redirected to new workbench
4. Can immediately start using with all original configurations

### Management Flow
1. Workbench owners can set visibility when creating/editing
2. Public workbenches show "Public" badge
3. Owners can duplicate their own workbenches
4. Fork/duplicate actions clearly distinguished in UI

## Security Considerations

- ✅ **Access Control**: Proper validation of fork permissions
- ✅ **Data Isolation**: Users only see their own chats in workbenches
- ✅ **Parameter Preservation**: All toolkit configurations maintained securely
- ✅ **Attribution**: Clear indication of forked workbench origins
- ✅ **Privacy**: Private workbenches remain completely private

## Files Modified

### API Layer
- `src/server/api/routers/workbenches.ts` - Added fork endpoints and public access

### Database
- `prisma/schema.prisma` - Added visibility and toolkitConfigs fields
- `prisma/migrations/` - Safe migration preserving existing data

### Frontend Components
- `src/app/workbench/public/page.tsx` - Public workbenches discovery page
- `src/app/workbench/[id]/_components/header.tsx` - Fork/duplicate actions
- `src/app/_components/sidebar/main.tsx` - Added public workbenches link

### Context Updates
- `src/app/_contexts/chat-context.tsx` - Support for new workbench structure
- Various components updated to handle toolkitConfigs vs toolkitIds

## Future Enhancements

Potential improvements for future iterations:
- **Workbench Categories**: Organize public workbenches by use case
- **Rating System**: Allow users to rate public workbenches
- **Featured Workbenches**: Highlight particularly useful configurations
- **Usage Analytics**: Track which workbenches are most forked
- **Collaboration**: Allow multiple owners or contributors
- **Templates**: Official workbench templates for common use cases