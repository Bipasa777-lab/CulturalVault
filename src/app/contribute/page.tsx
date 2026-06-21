"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import Link from "next/link";

export default function ContributePage() {
  const [myContributions, setMyContributions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    region: "",
    contributor: "",
    description: "",
    tags: "",
    lat: "",
    lng: "",
    image: "",
    culturalEra: "",
    sourceType: "",
    preservationStatus: "",
    importanceLevel: "",
    audio: "",
  });

  const currentUser = typeof window !== "undefined"
    ? (() => {
        try {
          const ua = localStorage.getItem("userAccount");
          if (ua) {
            const parsed = JSON.parse(ua);
            if (parsed && (parsed.id || parsed.email)) {
              return {
                id: parsed.id || parsed.email || "u1",
                name: parsed.name || "Demo User",
                email: parsed.email || ""
              };
            }
          }
        } catch (e) {}

        try {
          const up = localStorage.getItem("user_profile");
          if (up) {
            const parsed = JSON.parse(up);
            if (parsed && (parsed.id || parsed.email || parsed.name)) {
              return {
                id: parsed.id || parsed.email || "u1",
                name: parsed.name || "Demo User",
                email: parsed.email || ""
              };
            }
          }
        } catch (e) {}

        try {
          if (localStorage.getItem("adminLoggedIn") === "true") {
            return {
              id: "admin",
              name: "Admin User",
              email: "admin@culturalvault.com"
            };
          }
        } catch (e) {}

        return {};
      })()
    : {};

  const fetchMyContributions = useCallback(async () => {
    // Load local submissions first
    let localList: any[] = [];
    try {
      const localStored = localStorage.getItem("my_submitted_contributions");
      if (localStored) {
        localList = JSON.parse(localStored);
        if (!Array.isArray(localList)) localList = [];
      }
    } catch (e) {
      console.warn("Failed to load local submissions:", e);
    }

    if (!currentUser.id) {
      setMyContributions(localList);
      return;
    }

    try {
      const res = await fetch("/api/contributions");
      if (res.ok) {
        const data = await res.json();
        const apiUserContributions = (Array.isArray(data) ? data : []).filter(
          (c: any) => c.userId === currentUser.id || c.contributor?.trim().toLowerCase() === currentUser.name?.trim().toLowerCase()
        );

        // Merge API and local contributions (prefer server version if duplicate)
        const merged = [...apiUserContributions];
        localList.forEach((localItem: any) => {
          const exists = merged.some(
            (apiItem: any) => apiItem._id === localItem._id || apiItem.id === localItem._id
          );
          if (!exists) {
            merged.push(localItem);
          }
        });

        merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setMyContributions(merged);
      } else {
        setMyContributions(localList);
      }
    } catch (error) {
      console.warn("Failed to load contributions, using local fallback:", error);
      setMyContributions(localList);
    }
  }, [currentUser.id, currentUser.name]);

  useEffect(() => {
    fetchMyContributions();
  }, [fetchMyContributions]);

  useEffect(() => {
    if (currentUser.name && !form.contributor) {
      setForm((prev) => ({ ...prev, contributor: currentUser.name }));
    }
  }, [currentUser.name, form.contributor]);

  async function submitContribution() {
    if (
      !form.title ||
      !form.category ||
      !form.region ||
      !form.description
    ) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...form,
      userId: currentUser.id || "",
      lat: Number(form.lat),
      lng: Number(form.lng),
      tags: form.tags
        ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
    };

    let url = "/api/contributions";
    let method = "POST";

    if (editingId) {
      url = `/api/contributions/${editingId}`;
      method = "PUT";
    }

    let savedData: any = null;
    let savedLocallyOnly = false;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        savedData = await res.json();
      } else {
        savedLocallyOnly = true;
      }
    } catch (err) {
      console.warn("Backend submission failed, saving locally:", err);
      savedLocallyOnly = true;
    }

    if (savedLocallyOnly) {
      savedData = {
        ...payload,
        _id: editingId || `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        commentsCount: 0,
        verified: false,
        heritageScore: 75,
      };
      alert(
        editingId
          ? "Contribution updated locally (offline mode)."
          : "Database connection offline. Contribution saved locally in your browser!"
      );
    } else {
      alert(
        editingId
          ? "Contribution Updated Successfully!"
          : "Contribution Submitted Successfully!"
      );
    }

    try {
      const localStored = localStorage.getItem("my_submitted_contributions");
      let list = localStored ? JSON.parse(localStored) : [];
      if (!Array.isArray(list)) list = [];

      const targetId = editingId || savedData._id;
      if (editingId) {
        list = list.map((item: any) => (item._id === targetId || item.id === targetId) ? savedData : item);
      } else {
        list = [savedData, ...list];
      }
      localStorage.setItem("my_submitted_contributions", JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save local submission cache:", e);
    }

    setForm({
      title: "",
      category: "",
      region: "",
      contributor: "",
      description: "",
      tags: "",
      lat: "",
      lng: "",
      image: "",
      culturalEra: "",
      sourceType: "",
      preservationStatus: "",
      importanceLevel: "",
      audio: "",
    });
    setEditingId(null);
    fetchMyContributions();
  }

  const handleEdit = (c: any) => {
    setForm({
      title: c.title || "",
      category: c.category || "",
      region: c.region || "",
      contributor: c.contributor || "",
      description: c.description || "",
      tags: Array.isArray(c.tags) ? c.tags.join(", ") : "",
      lat: String(c.lat || ""),
      lng: String(c.lng || ""),
      image: c.image || "",
      culturalEra: c.culturalEra || "",
      sourceType: c.sourceType || "",
      preservationStatus: c.preservationStatus || "",
      importanceLevel: c.importanceLevel || "",
      audio: c.audio || "",
    });
    setEditingId(c._id || c.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contribution?")) return;
    
    try {
      const localStored = localStorage.getItem("my_submitted_contributions");
      if (localStored) {
        let list = JSON.parse(localStored);
        if (Array.isArray(list)) {
          list = list.filter((item: any) => item._id !== id && item.id !== id);
          localStorage.setItem("my_submitted_contributions", JSON.stringify(list));
        }
      }
    } catch (e) {
      console.warn("Failed to delete local contribution cache:", e);
    }

    try {
      const res = await fetch(`/api/contributions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Contribution Deleted Successfully!");
      } else {
        alert("Contribution removed from view.");
      }
      fetchMyContributions();
    } catch (err) {
      console.warn("Server deletion failed, removed from local view:", err);
      fetchMyContributions();
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-display mb-3 flex items-center gap-3">
            🌍 Cultural Heritage Community Hub
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Share cultural stories, traditions, festivals, folklore and heritage knowledge with the world.
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-border rounded-3xl p-6 sm:p-8 bg-card shadow-sm">
          <h2 className="text-2xl font-bold mb-6 font-display">
            {editingId ? "🏛 Edit Heritage Contribution" : "🏛 Submit Heritage Contribution"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Contributor Name"
              value={form.contributor}
              onChange={(e) => setForm({ ...form, contributor: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Latitude"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Longitude"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <input
              placeholder="Cultural Era (Ancient, Medieval, Colonial...)"
              value={form.culturalEra}
              onChange={(e) => setForm({ ...form, culturalEra: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Source Type (Folklore, Festival, Ritual...)"
              value={form.sourceType}
              onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Preservation Status"
              value={form.preservationStatus}
              onChange={(e) => setForm({ ...form, preservationStatus: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
            <input
              placeholder="Importance Level (Low / Medium / High)"
              value={form.importanceLevel}
              onChange={(e) => setForm({ ...form, importanceLevel: e.target.value })}
              className="border border-border p-3 rounded-xl bg-background text-foreground"
            />
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">Audio Narration</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setForm((prev) => ({ ...prev, audio: reader.result as string }));
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full border border-border p-3 rounded-xl bg-background text-foreground text-sm"
            />
          </div>

          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full border border-border p-3 rounded-xl mt-4 bg-background text-foreground"
          />

          <textarea
            placeholder="Tell the complete cultural story, tradition, folklore, festival or heritage knowledge..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-border p-3 rounded-xl mt-4 min-h-[200px] bg-background text-foreground"
          />

          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">Upload Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result as string }));
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full border border-border p-3 rounded-xl bg-background text-foreground text-sm"
            />
          </div>

          {form.image && (
            <div className="mt-4 p-4 border border-border/50 rounded-2xl bg-muted/20">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">Preview Image:</p>
              <img src={form.image} alt="Preview" className="w-full max-h-80 object-cover rounded-xl border" />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={submitContribution}
              className="bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md transition-all"
            >
              {editingId ? "Update Contribution" : "🚀 Submit Contribution"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: "",
                    category: "",
                    region: "",
                    contributor: "",
                    description: "",
                    tags: "",
                    lat: "",
                    lng: "",
                    image: "",
                    culturalEra: "",
                    sourceType: "",
                    preservationStatus: "",
                    importanceLevel: "",
                    audio: "",
                  });
                }}
                className="bg-secondary hover:bg-secondary/80 text-foreground border px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* My Submitted Contributions Section */}
        <div className="border border-border rounded-3xl p-6 sm:p-8 bg-card shadow-sm mt-10">
          <h2 className="text-2xl font-bold mb-6 font-display">
            📂 My Submitted Contributions
          </h2>
          {myContributions.length === 0 ? (
            <p className="text-muted-foreground text-sm italic py-4">
              You haven't submitted any community contributions yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myContributions.map((c) => (
                <div
                  key={c._id || c.id}
                  className="group overflow-hidden rounded-3xl border bg-card hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                >
                  {/* Image */}
                  {c.image ? (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                          {c.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      No Image Uploaded
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                          {c.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {c.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-3">
                        <p className="text-sm text-muted-foreground">
                          👤 {c.contributor || "Unknown Contributor"}
                        </p>
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-[10px]">
                          Contributor
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2">
                        📍 {c.region}
                      </p>

                      <div className="mt-2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                          Heritage Score: {c.heritageScore || 75}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between mt-4">
                      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                        <span>📅 {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Just now"}</span>
                        <div className="flex items-center gap-3">
                          <span>👁️ {c.views || 0}</span>
                          <span>❤️ {c.likes || 0}</span>
                          <span>💬 {c.commentsCount || 0}</span>
                        </div>
                      </div>

                      {c.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {c.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mt-4 text-muted-foreground line-clamp-4">
                        {c.description}
                      </p>

                      <Link
                        href={`/community-gallery/${c._id || c.id}`}
                        className="block mt-5 w-full bg-orange-500 text-white py-3 rounded-xl text-center hover:bg-orange-600 font-semibold"
                      >
                        Explore Heritage →
                      </Link>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                        <button
                          onClick={() => handleEdit(c)}
                          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id || c.id)}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thank You Section */}
        <div className="border border-border rounded-3xl p-6 sm:p-8 bg-card mt-10 text-center shadow-sm">
          <h3 className="text-2xl font-bold mb-4 font-display">
            🌍 Preserve Culture Together
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Every contribution helps document cultural heritage, oral traditions, rituals, folklore, festivals and community memories for future generations. Your knowledge becomes part of the CulturalVault archive.
          </p>
        </div>

      </div>
    </PageWrapper>
  );
}