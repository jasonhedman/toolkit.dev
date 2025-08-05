"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2, Search, UserPlus, Plus, X } from "lucide-react";

export default function FeaturesAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureDescription, setNewFeatureDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("");

  // Get all features
  const { data: features, refetch: refetchFeatures } =
    api.features.getAllFeatures.useQuery();

  // Search users
  const { data: searchResults, isLoading: isSearching } =
    api.features.searchUsers.useQuery(
      { query: searchQuery },
      { enabled: searchQuery.length > 0 },
    );

  // Mutations
  const createFeatureMutation = api.features.createFeature.useMutation({
    onSuccess: () => {
      toast.success("Feature created successfully");
      setNewFeatureName("");
      setNewFeatureDescription("");
      void refetchFeatures();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addFeatureToUserMutation = api.features.addFeatureToUser.useMutation({
    onSuccess: () => {
      toast.success("Feature added to user successfully");
      setSelectedUserId("");
      setSelectedFeatureId("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeFeatureFromUserMutation =
    api.features.removeFeatureFromUser.useMutation({
      onSuccess: () => {
        toast.success("Feature removed from user successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleCreateFeature = () => {
    if (!newFeatureName.trim()) {
      toast.error("Feature name is required");
      return;
    }

    createFeatureMutation.mutate({
      name: newFeatureName.trim(),
      description: newFeatureDescription.trim() ?? undefined,
    });
  };

  const handleAddFeatureToUser = () => {
    if (!selectedUserId || !selectedFeatureId) {
      toast.error("Please select both user and feature");
      return;
    }

    addFeatureToUserMutation.mutate({
      userId: selectedUserId,
      featureId: selectedFeatureId,
    });
  };

  const handleRemoveFeatureFromUser = (userId: string, featureId: string) => {
    removeFeatureFromUserMutation.mutate({
      userId,
      featureId,
    });
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Badge variant="secondary">Admin Access</Badge>
      </div>

      {/* Create New Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Feature
          </CardTitle>
          <CardDescription>
            Add new features that can be assigned to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Feature Name
              </label>
              <Input
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="e.g., premium, beta-access"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description (optional)
              </label>
              <Input
                value={newFeatureDescription}
                onChange={(e) => setNewFeatureDescription(e.target.value)}
                placeholder="Feature description"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateFeature}
            disabled={createFeatureMutation.isPending}
          >
            {createFeatureMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Feature
          </Button>
        </CardContent>
      </Card>

      {/* Search Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
          <CardDescription>
            Search for users by email or name to manage their features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="pl-10"
            />
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {user.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name ?? "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {user.userFeatures.map((userFeature) => (
                        <Badge
                          key={userFeature.id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() =>
                            handleRemoveFeatureFromUser(
                              user.id,
                              userFeature.feature.id,
                            )
                          }
                        >
                          {userFeature.feature.name}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Feature to User */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Feature to User
            </CardTitle>
            <CardDescription>
              Select a feature to add to the selected user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Selected User
                </label>
                <div className="bg-muted rounded-md p-2 text-sm">
                  {searchResults?.find((u) => u.id === selectedUserId)?.email ??
                    "No user selected"}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Feature
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {selectedFeatureId
                        ? (features?.find((f) => f.id === selectedFeatureId)
                            ?.name ?? "Select a feature")
                        : "Select a feature"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {features?.map((feature) => (
                      <DropdownMenuItem
                        key={feature.id}
                        onClick={() => setSelectedFeatureId(feature.id)}
                      >
                        {feature.name}
                        {feature.description && (
                          <span className="text-muted-foreground ml-2">
                            - {feature.description}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddFeatureToUser}
                disabled={addFeatureToUserMutation.isPending}
              >
                {addFeatureToUserMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Add Feature
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUserId("");
                  setSelectedFeatureId("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Features */}
      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>
            All features that can be assigned to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features?.map((feature) => (
              <div key={feature.id} className="rounded-lg border p-4">
                <div className="font-medium">{feature.name}</div>
                {feature.description && (
                  <div className="text-muted-foreground mt-1 text-sm">
                    {feature.description}
                  </div>
                )}
                <div className="text-muted-foreground mt-2 text-xs">
                  Created: {new Date(feature.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
