export enum TwitterTools {
  GetUserProfile = "get-user-profile",
  GetLatestTweets = "get-latest-tweets",
  SearchTweets = "search-tweets",
  GetBookmarks = "get-bookmarks",
  AddBookmark = "add-bookmark",
  RemoveBookmark = "remove-bookmark",
  GetTweetById = "get-tweet-by-id",
}

export * from "./profile/base";
export * from "./tweets/base";
export * from "./search-tweets/base";
export * from "./get-bookmarks/base";
export * from "./add-bookmark/base";
export * from "./remove-bookmark/base";
export * from "./get-tweet-by-id/base";
