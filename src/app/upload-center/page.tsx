"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UploadCenterPage() {
  const [storyCount, setStoryCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [languageCount, setLanguageCount] = useState(0);
  const [regionCount, setRegionCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      // 1. Load from local cache first if available
      try {
        const cached = localStorage.getItem("cached_stories");
        if (cached) {
          const parsed = JSON.parse(cached);
          const storiesArray = Array.isArray(parsed) ? parsed : [];
          setStoryCount(storiesArray.length);
          const languages = Array.from(new Set(storiesArray.map((story: any) => story.language).filter(Boolean)));
          const regions = Array.from(new Set(storiesArray.map((story: any) => story.region).filter(Boolean)));
          setLanguageCount(languages.length);
          setRegionCount(regions.length);
        }
      } catch (e) {
        console.error("Failed to load cached stories stats:", e);
      }

      // 2. Fetch fresh stats in background
      try {
        const res = await fetch("/api/stories");
        if (res.ok) {
          const stories = await res.json();
          const storiesArray = Array.isArray(stories) ? stories : [];
          setStoryCount(storiesArray.length);
          
          const languages = Array.from(
            new Set(
              storiesArray
                .map((story: any) => story.language)
                .filter(Boolean)
            )
          );

          const regions = Array.from(
            new Set(
              storiesArray
                .map((story: any) => story.region)
                .filter(Boolean)
            )
          );

          setLanguageCount(languages.length);
          setRegionCount(regions.length);
          if (storiesArray.length > 0) {
            try {
              localStorage.setItem("cached_stories", JSON.stringify(storiesArray));
            } catch (e) {
              console.warn("Storage quota exceeded, unable to cache stories:", e);
            }
          }
        }
      } catch (err) {
        console.warn("Error loading stories stats in contribution center, using local cache fallback:", err);
      }

      try {
        const articles = JSON.parse(
          localStorage.getItem("articles") || "[]"
        );
        setArticleCount(articles.length);
      } catch (err) {
        console.error("Error loading articles count:", err);
      }
    }
    
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-3">
          📤 Heritage Contribution Center
        </h1>

        <p className="text-muted-foreground text-lg">
          Share stories, research and cultural knowledge
          to help preserve global heritage for future generations.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">

        <div className="border rounded-2xl p-6 bg-card">
          <h3 className="text-muted-foreground text-sm">
            Stories Uploaded
          </h3>

          <p className="text-3xl font-bold mt-2 text-primary">
            {storyCount}
          </p>
        </div>

        <div className="border rounded-2xl p-6 bg-card">
          <h3 className="text-muted-foreground text-sm">
            Articles Published
          </h3>

          <p className="text-3xl font-bold mt-2 text-primary">
            {articleCount}
          </p>
        </div>

        <div className="border rounded-2xl p-6 bg-card">
          <h3 className="text-muted-foreground text-sm">
            Languages Preserved
          </h3>

          <p className="text-3xl font-bold mt-2 text-primary">
            {languageCount}
          </p>
        </div>

        <div className="border rounded-2xl p-6 bg-card">
          <h3 className="text-muted-foreground text-sm">
            Regions Covered
          </h3>

          <p className="text-3xl font-bold mt-2 text-primary">
            {regionCount}
          </p>
        </div>

      </div>

      {/* Upload Cards */}
      <div className="grid lg:grid-cols-2 gap-10">

        {/* Story Upload Card */}
        <div
          className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          bg-card
          p-8
          hover:border-primary/50
          hover:shadow-2xl
          hover:shadow-primary/10
          transition-all
          duration-300
          "
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

          <div className="text-6xl mb-6">
            🎙
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Oral Story Preservation
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Preserve folk tales, oral histories,
            interviews, legends and indigenous
            cultural memories through audio storytelling.
            Build a digital archive for future generations.
          </p>

          <div className="space-y-3 mb-8">
            <div>✅ Audio Story Upload</div>
            <div>✅ Narrator Information</div>
            <div>✅ Region & Language Tracking</div>
            <div>✅ Preservation Score</div>
            <div>✅ Geo-location Mapping</div>
          </div>

          <Link
            href="/stories"
            className="inline-flex bg-primary text-white px-6 py-3 rounded-xl hover:opacity-90"
          >
            Upload Story →
          </Link>
        </div>

        {/* Article Upload Card */}
        <div
          className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          bg-card
          p-8
          hover:border-primary/50
          hover:shadow-2xl
          hover:shadow-primary/10
          transition-all
          duration-300
          "
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

          <div className="text-6xl mb-6">
            🏛
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Heritage Knowledge Hub
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Publish cultural blogs, historical research,
            preservation reports, archaeological findings
            and heritage awareness articles to educate
            communities worldwide.
          </p>

          <div className="space-y-3 mb-8">
            <div>✅ Article Publishing</div>
            <div>✅ Heritage Research Papers</div>
            <div>✅ Historical Documentation</div>
            <div>✅ Cover Image Support</div>
            <div>✅ Threat Assessment Reports</div>
          </div>

          <Link
            href="/articles"
            className="inline-flex bg-primary text-white px-6 py-3 rounded-xl hover:opacity-90"
          >
            Publish Blog →
          </Link>
        </div>

      </div>
    </div>
  );
}