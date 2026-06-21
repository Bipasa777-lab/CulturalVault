import { CulturalItem } from "@/types";

export async function translateItem(item: CulturalItem, targetLanguage: string): Promise<CulturalItem> {
  if (!item || !targetLanguage || targetLanguage === "en") {
    return item;
  }

  const cacheKey = `translation_item_${item.id}_${targetLanguage}`;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached translation:", err);
      }
    }
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          title: item.title,
          description: item.description,
          longDescription: item.longDescription || item.description,
          location: item.location,
        },
        targetLanguage,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        const translatedItem = {
          ...item,
          title: data.result.title || item.title,
          description: data.result.description || item.description,
          longDescription: data.result.longDescription || item.longDescription,
          location: data.result.location || item.location,
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(translatedItem));
          } catch (e) {
            try {
              // Attempt to clear cached translation keys to free up space
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith("translation_item_") || key.startsWith("translation_story_"))) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach(k => localStorage.removeItem(k));
              localStorage.setItem(cacheKey, JSON.stringify(translatedItem));
            } catch (innerErr) {
              console.warn("Storage quota exceeded, unable to cache translation:", innerErr);
            }
          }
        }

        return translatedItem;
      }
    }
  } catch (error) {
    console.error("Error translating item:", error);
  }

  return item;
}

export async function translateStory(story: any, targetLanguage: string): Promise<any> {
  if (!story || !targetLanguage || targetLanguage === "en") {
    return story;
  }

  const cacheKey = `translation_story_${story._id || story.id}_${targetLanguage}`;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached translation:", err);
      }
    }
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          title: story.title,
          description: story.description,
          region: story.region,
          category: story.category,
        },
        targetLanguage,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        const translatedStory = {
          ...story,
          title: data.result.title || story.title,
          description: data.result.description || story.description,
          region: data.result.region || story.region,
          category: data.result.category || story.category,
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(translatedStory));
          } catch (e) {
            try {
              // Attempt to clear cached translation keys to free up space
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith("translation_item_") || key.startsWith("translation_story_"))) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach(k => localStorage.removeItem(k));
              localStorage.setItem(cacheKey, JSON.stringify(translatedStory));
            } catch (innerErr) {
              console.warn("Storage quota exceeded, unable to cache translation:", innerErr);
            }
          }
        }

        return translatedStory;
      }
    }
  } catch (error) {
    console.error("Error translating story:", error);
  }

  return story;
}
