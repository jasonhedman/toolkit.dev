# Strava Toolkit

A comprehensive fitness tracking toolkit that integrates with Strava's API to provide AI chatbots with access to fitness data, activity analytics, performance insights, and training information.

## Features

### Core Functionality
- **Athlete Profile**: Access user profile information, premium status, and gear
- **Activity Management**: Retrieve and analyze activities with detailed metrics
- **Performance Analytics**: Comprehensive statistics across different activity types
- **Segment Exploration**: Search and analyze popular segments with leaderboards
- **Route Access**: View saved and created routes (Premium feature)
- **Training Zones**: Access heart rate and power zones for personalized insights

### UI Components
- **Activity Cards**: Rich activity visualizations with metrics and context
- **Stats Dashboard**: Comprehensive statistics with tabbed views by activity type
- **Performance Charts**: Visual representations of training data
- **Segment Leaderboards**: Competitive analysis and rankings
- **Zone Visualizations**: Training zone breakdowns and recommendations

## Tools Available

### 1. Get Athlete Profile (`get-athlete-profile`)
Retrieves the authenticated user's profile information.

**Output includes:**
- Personal information (name, location, premium status)
- Follower/friend counts and athlete type
- FTP and weight data for training analysis
- Account creation and update timestamps

### 2. Get Athlete Activities (`get-athlete-activities`)
Fetches a paginated list of activities with filtering options.

**Parameters:**
- `page`: Page number for pagination
- `per_page`: Activities per page (max 200)
- `before`/`after`: Unix timestamps for date filtering

**Output includes:**
- Activity metadata (name, type, date)
- Performance metrics (distance, time, speed, elevation)
- Heart rate data and social engagement (kudos, comments)
- Map data and achievement counts

### 3. Get Activity Details (`get-activity-details`)
Provides comprehensive details about a specific activity.

**Parameters:**
- `id`: Activity ID
- `include_all_efforts`: Include segment efforts (optional)

**Output includes:**
- Full activity statistics and performance data
- Segment efforts with KOM/QOM rankings
- Detailed map data with polylines
- Equipment and workout type information

### 4. Get Athlete Stats (`get-athlete-stats`)
Comprehensive statistics across different time periods.

**Output includes:**
- Recent (4 weeks), year-to-date, and all-time totals
- Activity counts, distances, and moving times
- Elevation gain and achievement counts
- Separate stats for running, cycling, and swimming

### 5. Search Segments (`search-segments`)
Discover popular segments using geographic filters.

**Parameters:**
- `bounds`: Geographic bounding box (lat/lng coordinates)
- `activity_type`: Filter by "running" or "riding"

**Output includes:**
- Segment metadata and difficulty ratings
- Location information and hazard status
- Elevation profiles and climb categories

### 6. Get Segment Details (`get-segment-details`)
Detailed information about a specific segment.

**Parameters:**
- `id`: Segment ID

**Output includes:**
- Complete segment statistics and location data
- Effort counts and athlete participation
- Personal segment statistics for the user

### 7. Get Segment Leaderboard (`get-segment-leaderboard`)
Access segment leaderboards with advanced filtering.

**Parameters:**
- `id`: Segment ID
- `gender`: Filter by "M" or "F"
- `age_group`: Age-based filtering
- `weight_class`: Weight class filtering
- `following`: Show only followed athletes
- `club_id`: Club-specific leaderboards
- `date_range`: Time-based filtering

**Output includes:**
- Ranked athlete performances
- Detailed timing and activity information
- Athlete profiles and demographics

### 8. Get Routes (`get-routes`)
Access saved and created routes (Premium feature).

**Parameters:**
- `page`: Page number for pagination
- `per_page`: Routes per page

**Output includes:**
- Route metadata and descriptions
- Distance and elevation profiles
- Map data with polylines
- Associated segments and route types

### 9. Get Athlete Zones (`get-athlete-zones`)
Training zones for personalized workout analysis.

**Output includes:**
- Heart rate zones with custom zone support
- Power zones (Premium feature)
- Zone boundaries and training recommendations

## Usage Examples

### Basic Activity Analysis
```typescript
// Get recent activities
const activities = await stravaGetAthleteActivities({ 
  per_page: 10,
  after: Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
});

// Analyze a specific workout
const activity = await stravaGetActivityDetails({
  id: activities.activities[0].id,
  include_all_efforts: true
});
```

### Performance Tracking
```typescript
// Get comprehensive stats
const stats = await stravaGetAthleteStats();

// Access training zones
const zones = await stravaGetAthleteZones();
```

### Segment Exploration
```typescript
// Find segments near San Francisco
const segments = await stravaSearchSegments({
  bounds: "37.7749,-122.4194,37.8049,-122.3894",
  activity_type: "running"
});

// Get leaderboard for competitive analysis
const leaderboard = await stravaGetSegmentLeaderboard({
  id: segments.segments[0].id,
  gender: "M",
  age_group: "25_34"
});
```

## Common AI Chatbot Use Cases

### 1. Training Analysis
*"Analyze my last 5 runs and show me pace trends"*
- Fetch recent running activities
- Calculate pace progressions and patterns
- Identify training zone distribution

### 2. Performance Comparison
*"How does my cycling performance compare to last year?"*
- Get year-to-date and all-time statistics
- Compare distances, speeds, and elevation gains
- Highlight improvements and areas for focus

### 3. Route Discovery
*"Find challenging cycling routes near my location"*
- Search segments in the user's area
- Filter by difficulty and activity type
- Provide route recommendations with elevation profiles

### 4. Competitive Analysis
*"Show me how I rank on my favorite segments"*
- Get segment details and leaderboards
- Compare personal performance to others
- Identify opportunities for improvement

### 5. Training Planning
*"Create a training plan based on my current fitness level"*
- Analyze recent activity patterns
- Use heart rate and power zones
- Recommend workout intensities and durations

## Authentication Requirements

The Strava toolkit requires OAuth authentication with the following scopes:
- `read`: Access to public activity data
- `activity:read`: Access to detailed activity information
- `activity:read_all`: Access to private activities (optional)

## Rate Limits

Strava API rate limits:
- **600 requests per 15 minutes**
- **30,000 requests per day**

The toolkit automatically handles rate limiting and provides clear error messages when limits are exceeded.

## Premium Features

Some features require Strava Premium:
- Routes access
- Power zones
- Advanced training analytics

The toolkit gracefully handles cases where premium features are not available.

## Error Handling

The toolkit provides comprehensive error handling for:
- Authentication failures
- Rate limit exceeded
- Invalid parameters
- Network connectivity issues
- Premium feature access denied

## UI Components

### Activity Card
Displays activity summaries with key metrics, social engagement, and performance data.

### Stats Dashboard
Comprehensive statistics dashboard with tabbed views for different activity types, progress tracking, and achievement displays.

### Performance Visualizations
Charts and graphs for pace analysis, elevation profiles, and training zone distributions.

## Integration

The Strava toolkit is fully integrated into the platform's toolkit system and can be used alongside other toolkits for comprehensive fitness and productivity workflows.

Example combined workflows:
- Log workouts to Notion after Strava analysis
- Store training insights in Memory toolkit
- Search for training articles using Exa toolkit
- Schedule recovery sessions in Google Calendar 