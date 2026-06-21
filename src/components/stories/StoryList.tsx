"use client";

import { useEffect, useState } from "react";
import StoryCard from "./StoryCard";

export default function StoryList({
  onEditStory,
}: {
  onEditStory: (story: any) => void;
}) {
  const [stories, setStories] = useState<any[]>([]);

  const loadStories = async () => {
    let localList: any[] = [];
    try {
      const localStored = localStorage.getItem("my_uploaded_stories");
      if (localStored) {
        localList = JSON.parse(localStored);
        if (!Array.isArray(localList)) localList = [];
      }
    } catch (e) {
      console.warn("Failed to parse local stories:", e);
    }

    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      const storiesList = Array.isArray(data) ? data : [];

      // Merge server stories and local stories (prefer server/db version if duplicate)
      const merged = [...storiesList];
      localList.forEach((localItem: any) => {
        const exists = merged.some(
          (apiItem: any) => apiItem._id === localItem._id || apiItem.id === localItem._id
        );
        if (!exists) {
          merged.push(localItem);
        }
      });

      setStories(merged);
      if (merged.length > 0) {
        try {
          localStorage.setItem("cached_stories", JSON.stringify(merged));
        } catch (e) {
          console.warn("Storage quota exceeded, unable to cache stories:", e);
        }
      }
    } catch (error) {
      console.warn("Failed to load stories, using local cache fallback:", error);
      let cachedList: any[] = [];
      try {
        const cached = localStorage.getItem("cached_stories");
        if (cached) {
          cachedList = JSON.parse(cached);
        }
      } catch (e) {}

      const fallbackMerged = Array.isArray(cachedList) ? [...cachedList] : [];
      localList.forEach((localItem: any) => {
        const exists = fallbackMerged.some(
          (apiItem: any) => apiItem._id === localItem._id || apiItem.id === localItem._id
        );
        if (!exists) {
          fallbackMerged.push(localItem);
        }
      });
      setStories(fallbackMerged);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const localStored = localStorage.getItem("my_uploaded_stories");
      if (localStored) {
        let list = JSON.parse(localStored);
        if (Array.isArray(list)) {
          list = list.filter((item: any) => item._id !== id && item.id !== id);
          localStorage.setItem("my_uploaded_stories", JSON.stringify(list));
        }
      }
    } catch (e) {
      console.error("Failed to delete local story cache:", e);
    }

    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Story deleted successfully!");
      } else {
        alert("Story removed from local view.");
      }
      loadStories();
    } catch (error) {
      console.warn("Server deletion failed, removed from local view:", error);
      loadStories();
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem("cached_stories");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStories(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to parse cached stories in list:", e);
    }

    loadStories();

    const refreshStories = () => {
      loadStories();
    };

    window.addEventListener(
      "storiesUpdated",
      refreshStories
    );

    return () => {
      window.removeEventListener(
        "storiesUpdated",
        refreshStories
      );
    };
  }, []);


  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          Uploaded Story Section
        </h2>

        <span className="text-muted-foreground">
          {stories.length} Stories
        </span>
      </div>

      {stories.length === 0 ? (
        <div className="border rounded-2xl p-10 text-center bg-card">
          <h3 className="text-xl font-semibold mb-2">
            No Stories Found
          </h3>

          <p className="text-muted-foreground">
            Upload your first cultural story.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              onEdit={onEditStory}
              onDelete={handleDeleteStory}
            />
          ))}
        </div>
      )}
    </div>
  );
}