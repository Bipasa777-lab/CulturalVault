"use client";

import { useEffect, useState } from "react";

export default function StoryUpload({
  editingStory,
  setEditingStory,
}: {
  editingStory: any;
  setEditingStory: (story: any) => void;
}) {
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [story, setStory] = useState({
    title: "",
    region: "",
    language: "",
    narrator: "",
    contributor: "",
    category: "",
    score: "",
    lat: "",
    lng: "",
    description: "",
    audio: "",
    image: "",
    gallery: [],
  });

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("userAccount") || "{}"
    );

    if (editingStory) {
      setStory({
        title: editingStory.title || "",
        region: editingStory.region || "",
        language: editingStory.language || "",
        narrator: editingStory.narrator || "",
        contributor: editingStory.userName || "",
        category: editingStory.category || "",
        score: String(editingStory.score || ""),
        lat: String(editingStory.lat || ""),
        lng: String(editingStory.lng || ""),
        description: editingStory.description || "",
        audio: editingStory.audio || "",
        image: editingStory.image || "",
        gallery: editingStory.gallery || [],
      });
      setEditingId(editingStory._id || editingStory.id || null);
    } else {
      setStory({
        title: "",
        region: "",
        language: "",
        narrator: "",
        contributor: currentUser.name || "",
        category: "",
        score: "",
        lat: "",
        lng: "",
        description: "",
        audio: "",
        image: "",
        gallery: [],
      });
      setEditingId(null);
    }
  }, [editingStory]);

  const saveStory = async () => {
    if (
      !story.title ||
      !story.region ||
      !story.language ||
      !story.narrator
    ) {
      alert("Please fill all required fields");
      return;
    }

    const currentUser = JSON.parse(
      localStorage.getItem("userAccount") || "{}"
    );

    const payload = {
      userId: currentUser.id || "anonymous",
      userName: story.contributor || currentUser.name || "Anonymous Contributor",
      title: story.title,
      region: story.region,
      language: story.language,
      narrator: story.narrator,
      category: story.category,
      score: Number(story.score || 0),
      lat: Number(story.lat || 0),
      lng: Number(story.lng || 0),
      description: story.description,
      audio: story.audio,
      image: story.image,
      gallery: story.gallery,
    };

    let savedData: any = null;
    let savedLocallyOnly = false;

    if (editingId) {
      try {
        const response = await fetch(`/api/stories/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          savedData = await response.json();
        } else {
          savedLocallyOnly = true;
        }
      } catch (error) {
        console.warn("Backend update failed, updating locally:", error);
        savedLocallyOnly = true;
      }

      if (savedLocallyOnly) {
        savedData = {
          ...payload,
          _id: editingId,
          createdAt: new Date().toISOString(),
          views: 0,
          likes: 0,
        };
        alert("Story updated locally (offline mode).");
      } else {
        alert("Story Updated Successfully!");
      }
    } else {
      try {
        const response = await fetch("/api/stories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          savedData = await response.json();
        } else {
          savedLocallyOnly = true;
        }
      } catch (error) {
        console.warn("Backend submission failed, saving locally:", error);
        savedLocallyOnly = true;
      }

      if (savedLocallyOnly) {
        savedData = {
          ...payload,
          _id: `local_story_${Date.now()}`,
          createdAt: new Date().toISOString(),
          views: 0,
          likes: 0,
        };
        alert("Database connection offline. Story saved locally in your browser!");
      } else {
        alert("Story Saved Successfully!");
      }
    }

    try {
      const localStored = localStorage.getItem("my_uploaded_stories");
      let list = localStored ? JSON.parse(localStored) : [];
      if (!Array.isArray(list)) list = [];

      const targetId = editingId || savedData._id;
      if (editingId) {
        list = list.map((item: any) => (item._id === targetId || item.id === targetId) ? savedData : item);
      } else {
        list = [savedData, ...list];
      }
      localStorage.setItem("my_uploaded_stories", JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save local story cache:", e);
    }

    window.dispatchEvent(
      new Event("storiesUpdated")
    );

    setStory({
      title: "",
      region: "",
      language: "",
      narrator: "",
      contributor: currentUser.name || "",
      category: "",
      score: "",
      lat: "",
      lng: "",
      description: "",
      audio: "",
      image: "",
      gallery: [],
    });
    setEditingStory(null);
  };

  return (
    <div className="border rounded-2xl p-6 bg-card">
      <h2 className="text-2xl font-bold mb-6">
        {editingId
          ? "Edit Story"
          : "Upload Story"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          placeholder="Story Title"
          value={story.title}
          onChange={(e) =>
            setStory({
              ...story,
              title: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Contributor Name"
          value={story.contributor}
          onChange={(e) =>
            setStory({
              ...story,
              contributor: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Region"
          value={story.region}
          onChange={(e) =>
            setStory({
              ...story,
              region: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Language"
          value={story.language}
          onChange={(e) =>
            setStory({
              ...story,
              language: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Narrator"
          value={story.narrator}
          onChange={(e) =>
            setStory({
              ...story,
              narrator: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Story Category"
          value={story.category}
          onChange={(e) =>
            setStory({
              ...story,
              category: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Preservation Score (0-100)"
          value={story.score}
          onChange={(e) =>
            setStory({
              ...story,
              score: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={story.lat}
          onChange={(e) =>
            setStory({
              ...story,
              lat: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={story.lng}
          onChange={(e) =>
            setStory({
              ...story,
              lng: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />
      </div>

      <h3 className="font-semibold mt-5 mb-2">
      🎙 Audio Narration (Optional)
       </h3>

      <div className="mt-4">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              const reader = new FileReader();

              reader.onload = () => {
                setStory((prev) => ({
                  ...prev,
                  audio:
                    reader.result as string,
                }));
              };

              reader.readAsDataURL(file);
            }
          }}
          className="w-full border rounded-xl p-3"
        />
      </div>

      <h3 className="font-semibold mt-5 mb-2">
  🖼 Story Cover Image
</h3>

      <div className="mt-4">
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = () => {
          setStory((prev) => ({
            ...prev,
            image: reader.result as string,
          }));
        };

        reader.readAsDataURL(file);
      }
    }}
    className="w-full border rounded-xl p-3"
  />
</div>


<h3 className="font-semibold mt-5 mb-2">
  📸 Story Gallery Images
</h3>

<div className="mt-4">
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = Array.from(
        e.target.files || []
      );

      files.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          setStory((prev: any) => ({
            ...prev,
            gallery: [
              ...prev.gallery,
              reader.result as string,
            ],
          }));
        };

        reader.readAsDataURL(file);
      });
    }}
    className="w-full border rounded-xl p-3"
  />
</div>

      <textarea
        placeholder="Story Description"
        value={story.description}
        onChange={(e) =>
          setStory({
            ...story,
            description: e.target.value,
          })
        }
        className="w-full border rounded-xl p-3 mt-4 min-h-[300px]"
        rows={12}
      />

      <div className="flex gap-4 mt-5">
        <button
          onClick={saveStory}
          className="bg-primary text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all font-semibold"
        >
          {editingId ? "Update Story" : "Save Story"}
        </button>
        {editingId && (
          <button
            onClick={() => setEditingStory(null)}
            className="bg-secondary text-foreground border border-border px-6 py-3 rounded-xl hover:bg-secondary/80 transition-all font-semibold"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </div>
  );
}