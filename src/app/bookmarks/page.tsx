"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useBookmarks } from "@/context/BookmarksContext";
import { ItemCard } from "@/components/cards/ItemCard";
import { CulturalItem } from "@/types";
import { FolderHeart, BookOpen, FileText, Landmark } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { translateItem } from "@/utils/translate";
import { CardSkeleton } from "@/components/skeletons/CardSkeleton";

export default function BookmarksPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { bookmarks } = useBookmarks();
  const [loading, setLoading] = useState(true);
  const [bookmarkedStories, setBookmarkedStories] = useState<CulturalItem[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<CulturalItem[]>([]);
  const [bookmarkedHeritage, setBookmarkedHeritage] = useState<CulturalItem[]>([]);

  const [displayedHeritage, setDisplayedHeritage] = useState<CulturalItem[]>([]);
  const [displayedStories, setDisplayedStories] = useState<CulturalItem[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<CulturalItem[]>([]);

  useEffect(() => {
    if (bookmarks.length === 0) {
      setBookmarkedHeritage([]);
      setBookmarkedStories([]);
      setBookmarkedArticles([]);
      setLoading(false);
      return;
    }

    // 1. Instantly parse and set bookmarked articles from localStorage
    try {
      const articlesData = JSON.parse(localStorage.getItem("articles") || "[]");
      const mappedArticles: CulturalItem[] = articlesData.map((article: any) => ({
        id: String(article.id),
        title: article.title,
        description: article.shortDescription || article.content || "",
        longDescription: article.content || "",
        category: "Articles",
        tags: article.tags || [],
        imageUrl: article.image || "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80",
        location: article.region || "Global",
        era: "Contemporary",
        rating: 4.5,
        reviewCount: 0,
        featured: false,
        createdAt: article.createdAt || new Date().toISOString(),
        views: article.views || 0,
        likes: article.likes || 0,
        contentType: "Articles",
        artifacts: [],
        curator: { name: "Author", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", title: "Contributor" }
      }));
      setBookmarkedArticles(mappedArticles.filter(item => bookmarks.includes(item.id)));
    } catch (err) {
      console.error("Failed to load articles synchronously", err);
    }

    // 2. Instantly parse and set bookmarked stories from localStorage cache
    const cachedStories = localStorage.getItem("cached_stories");
    if (cachedStories) {
      try {
        const parsed = JSON.parse(cachedStories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mappedStories: CulturalItem[] = parsed.map((story: any) => ({
            id: story._id || story.id,
            title: story.title,
            description: story.description || "",
            longDescription: story.description || "",
            category: "Stories",
            tags: [story.language, story.region].filter(Boolean),
            imageUrl: story.image || "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
            location: story.region,
            era: "Contemporary",
            rating: 4.8,
            reviewCount: 0,
            featured: false,
            createdAt: story.createdAt || new Date().toISOString(),
            views: story.views || 0,
            likes: story.likes || 0,
            contentType: "Stories",
            artifacts: [],
            curator: { name: story.userName || "Unknown Contributor", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", title: "Contributor" }
          }));
          setBookmarkedStories(mappedStories.filter(item => bookmarks.includes(item.id)));
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load cached stories", e);
      }
    }

    async function loadAPIData() {
      if (!cachedStories) {
        setLoading(true);
      }
      try {
        // Fetch Heritage Items (Mock Items)
        let mockData: CulturalItem[] = [];
        try {
          const mockRes = await fetch("/api/items?limit=100");
          if (mockRes.ok) {
            const json = await mockRes.json();
            mockData = json.data || [];
          }
        } catch (err) {
          console.error("Failed to load heritage items", err);
        }

        // Fetch Stories
        let storiesData: any[] = [];
        try {
          const storiesRes = await fetch("/api/stories");
          if (storiesRes.ok) {
            const data = await storiesRes.json();
            storiesData = Array.isArray(data) ? [...data] : [];
          }
        } catch (err) {
          console.warn("Failed to load stories, using local fallback:", err);
        }

        // Merge local user-submitted stories
        try {
          const localStored = localStorage.getItem("my_uploaded_stories");
          if (localStored) {
            const localList = JSON.parse(localStored);
            if (Array.isArray(localList)) {
              localList.forEach((localItem: any) => {
                const exists = storiesData.some((apiItem: any) => apiItem._id === localItem._id || apiItem.id === localItem._id);
                if (!exists) {
                  storiesData.push(localItem);
                }
              });
            }
          }
        } catch (e) {
          console.warn("Failed to merge local stories in bookmarks page:", e);
        }

        if (storiesData.length > 0) {
          try {
            localStorage.setItem("cached_stories", JSON.stringify(storiesData));
          } catch (e) {
            console.warn("Storage quota exceeded, unable to cache stories:", e);
          }
        }

        // Map stories to CulturalItem interface
        const mappedStories: CulturalItem[] = storiesData.map((story: any) => ({
          id: story._id || story.id,
          title: story.title,
          description: story.description || "",
          longDescription: story.description || "",
          category: "Stories",
          tags: [story.language, story.region].filter(Boolean),
          imageUrl: story.image || "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
          location: story.region,
          era: "Contemporary",
          rating: 4.8,
          reviewCount: 0,
          featured: false,
          createdAt: story.createdAt || new Date().toISOString(),
          views: story.views || 0,
          likes: story.likes || 0,
          contentType: "Stories",
          artifacts: [],
          curator: { name: story.userName || "Unknown Contributor", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", title: "Contributor" }
        }));

        setBookmarkedHeritage(mockData.filter(item => bookmarks.includes(item.id)));
        setBookmarkedStories(mappedStories.filter(item => bookmarks.includes(item.id)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAPIData();
  }, [bookmarks]);

  // Localize bookmarks on the fly when language changes
  useEffect(() => {
    let active = true;
    async function localizeBookmarks() {
      if (language === "en") {
        setDisplayedHeritage(bookmarkedHeritage);
        setDisplayedStories(bookmarkedStories);
        setDisplayedArticles(bookmarkedArticles);
        return;
      }

      const [transHeritage, transStories, transArticles] = await Promise.all([
        Promise.all(bookmarkedHeritage.map(item => translateItem(item, language))),
        Promise.all(bookmarkedStories.map(item => translateItem(item, language))),
        Promise.all(bookmarkedArticles.map(item => translateItem(item, language)))
      ]);

      if (active) {
        setDisplayedHeritage(transHeritage);
        setDisplayedStories(transStories);
        setDisplayedArticles(transArticles);
      }
    }
    localizeBookmarks();
    return () => {
      active = false;
    };
  }, [bookmarkedHeritage, bookmarkedStories, bookmarkedArticles, language]);

  const totalCollectionCount = bookmarkedStories.length + bookmarkedArticles.length + bookmarkedHeritage.length;

  return (
    <PageWrapper className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-display flex items-center gap-3">
              📚 {t.myBookmarks}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {t.myBookmarksSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border rounded-2xl text-sm font-semibold self-start">
            <FolderHeart className="size-4" />
            <span>{bookmarks.length} {t.itemsSaved}</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold font-display flex items-center gap-2 mb-6 text-foreground border-b pb-2 border-border/50">
                <Landmark className="size-5 text-amber-500 animate-pulse" />
                {t.loadingBookmarks || "Loading Saved Items..."}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: Math.min(bookmarks.length, 4) || 4 }).map((_, idx) => (
                  <CardSkeleton key={idx} />
                ))}
              </div>
            </div>
          </div>
        ) : totalCollectionCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl p-6 bg-card text-center">
            <FolderHeart className="size-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-1">{t.bookmarksEmpty}</h3>
            <p className="text-muted-foreground max-w-sm mb-6 text-sm">
              {t.bookmarksEmptySubtitle}
            </p>
            <a 
              href="/explore" 
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all text-sm"
            >
              {t.startExploring}
            </a>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 1. Heritage Sites & Items */}
            {displayedHeritage.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-display flex items-center gap-2 mb-6 text-foreground border-b pb-2 border-border/50">
                  <Landmark className="size-5 text-amber-500" />
                  {t.heritageSitesItems} ({displayedHeritage.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayedHeritage.map((item, idx) => (
                    <ItemCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Stories */}
            {displayedStories.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-display flex items-center gap-2 mb-6 text-foreground border-b pb-2 border-border/50">
                  <BookOpen className="size-5 text-orange-500" />
                  {t.preservedStories} ({displayedStories.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayedStories.map((item, idx) => (
                    <ItemCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Articles */}
            {displayedArticles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-display flex items-center gap-2 mb-6 text-foreground border-b pb-2 border-border/50">
                  <FileText className="size-5 text-blue-500" />
                  {t.knowledgeHubArticles} ({displayedArticles.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayedArticles.map((item, idx) => (
                    <ItemCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </PageWrapper>
  );
}