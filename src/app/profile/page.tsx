"use client";

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { getCategoryColor, getCategoryIcon, cn } from "@/utils";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    interests: [] as string[],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    image: "",
    interests: [] as string[],
  });

  const CULTURAL_CATEGORIES = [
    "Architecture",
    "Art",
    "Music",
    "Literature",
    "Cuisine",
    "Traditions",
    "Crafts",
    "Dance",
  ];

  const [stats, setStats] = useState({
  contributions: 0,
  likes: 0,
  views: 0,
  regions: 0,
  heritageScore: 0,
  streak: 0,
  leaderboardPosition: 1,
  rank: "Explorer",
});

  const [recentContributions, setRecentContributions] =
    useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stored = localStorage.getItem("user_profile");
    if (!stored && localStorage.getItem("user_token")) {
      const defaultUser = {
        id: "u1",
        name: "Demo User",
        email: "demo@culturalvault.com",
        image: "",
        interests: ["Architecture", "Art"],
      };
      localStorage.setItem("user_profile", JSON.stringify(defaultUser));
      stored = JSON.stringify(defaultUser);
    }

    if (stored) {
      const user = JSON.parse(stored);
      if (!localStorage.getItem("userAccount")) {
        localStorage.setItem("userAccount", JSON.stringify({
          id: user.id || "u1",
          name: user.name,
          email: user.email
        }));
      }
      if (!user.interests) user.interests = [];
      setProfile(user);
      fetchContributions(user.name);
    }
  }, []);

  const handleStartEdit = () => {
    setEditForm({
      name: profile.name,
      email: profile.email,
      image: profile.image || "",
      interests: profile.interests || [],
    });
    setIsEditing(true);
  };

  const toggleEditFormInterest = (category: string) => {
    setEditForm((prev) => {
      const interests = prev.interests || [];
      const updated = interests.includes(category)
        ? interests.filter((c) => c !== category)
        : [...interests, category];
      return { ...prev, interests: updated };
    });
  };

  const handleSaveProfile = () => {
    const updated = {
      ...profile,
      name: editForm.name,
      email: editForm.email,
      image: editForm.image,
      interests: editForm.interests,
    };
    setProfile(updated);
    localStorage.setItem("user_profile", JSON.stringify(updated));
    setIsEditing(false);
    fetchContributions(updated.name);
  };

  async function fetchContributions(
  userName: string
) {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/contributions"
      );

      const data = await res.json();
      const dataArray = Array.isArray(data) ? data : [];

      // Merge local user-submitted contributions
      let mergedList = [...dataArray];
      try {
        const localStored = localStorage.getItem("my_submitted_contributions");
        if (localStored) {
          const localList = JSON.parse(localStored);
          if (Array.isArray(localList)) {
            localList.forEach((localItem: any) => {
              const exists = mergedList.some((apiItem: any) => apiItem._id === localItem._id || apiItem.id === localItem._id);
              if (!exists) {
                mergedList.push(localItem);
              }
            });
          }
        }
      } catch (e) {
        console.warn("Failed to merge local contributions in profile:", e);
      }

      console.log("Profile Name:", userName);

      console.log(
        "Contributors:",
        mergedList.map((x:any) => x.contributor)
      );

      const userContributions = mergedList.filter(
        (item: any) =>
          item.contributor?.trim().toLowerCase() ===
          userName?.trim().toLowerCase()
      );

console.log(
  "User Contributions:",
  userContributions
);

      setRecentContributions(
  userContributions.slice(0, 5)
);

      const totalLikes =
  userContributions.reduce(
    (sum: number, item: any) =>
      sum + (item.likes || 0),
    0
  );

      const totalViews =
  userContributions.reduce(
    (sum: number, item: any) =>
      sum + (item.views || 0),
    0
  );

  const contributions =
  userContributions.length;


      let rank = "Explorer";

      if (contributions >= 30)
        rank =
          "Cultural Ambassador";
      else if (contributions >= 15)
        rank =
          "Heritage Guardian";
      else if (contributions >= 5)
        rank = "Story Keeper";

      const regions = new Set(
  userContributions.map(
    (item: any) => item.region
  )
).size;

const heritageScore =
  contributions * 10 +
  totalLikes * 2 +
  totalViews;

const streak =
  contributions > 0
    ? Math.min(
        contributions,
        30
      )
    : 0;

setStats({
  contributions,
  likes: totalLikes,
  views: totalViews,
  regions,
  heritageScore,
  streak,
  leaderboardPosition: 1,
  rank,
});
    } catch (error) {
  console.error(error);
} finally {
  setLoading(false);
}
  }

  return (
    <PageWrapper className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-5xl font-bold">
          👤 Profile Dashboard
        </h1>

        <p className="text-muted-foreground mt-2">
          Track your heritage
          contributions and impact.
        </p>
      </div>

      {/* Profile Card */}

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="border rounded-3xl p-6">

          <div className="flex items-center gap-4">

            {isEditing ? (
              <label htmlFor="profilePhotoInput" className="relative cursor-pointer group block shrink-0">
                {editForm.image ? (
                  <div className="relative w-20 h-20">
                    <img
                      src={editForm.image}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-orange-500 group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold text-center leading-tight">Change<br/>Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center text-3xl font-bold text-orange-500 group-hover:bg-orange-500/30 transition-colors">
                    {editForm.name ? editForm.name.charAt(0).toUpperCase() : "U"}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold text-center leading-tight">Change<br/>Photo</span>
                    </div>
                  </div>
                )}
                <input
                  id="profilePhotoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setEditForm((prev) => ({
                        ...prev,
                        image: reader.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            ) : (
              profile.image ? (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-orange-500 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center text-3xl font-bold text-orange-500 shrink-0">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
              )
            )}

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 bg-background text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Email"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold">
                    {profile.name || "User Name"}
                  </h2>

                  <p className="text-muted-foreground text-sm">
                    {profile.email || "email@example.com"}
                  </p>
                </>
              )}
            </div>

          </div>

          <div className="mt-5 flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  💾 Save
                </button>
                
                <label
                  htmlFor="profilePhotoInput"
                  className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold inline-block transition"
                >
                  📷 Photo
                </label>

                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-secondary text-foreground border border-border hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartEdit}
                  className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  ✏️ Edit Profile
                </button>
              </>
            )}
          </div>

          <div className="mt-6">

            <h3 className="font-semibold">
              🏆 Heritage Rank
            </h3>

            <div className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-xl inline-block">
              {stats.rank}
            </div>

          </div>

          <div className="mt-5 border rounded-2xl p-4">

  <h3 className="font-semibold">
    🏆 Community Rank
  </h3>

  <p className="text-4xl font-bold mt-2">
    #{stats.leaderboardPosition}
  </p>

</div>

          <div className="mt-6">

            <div className="flex justify-between mb-2">
              <span>
                Next Rank Progress
              </span>

              <span>
                {Math.min(
                  stats.contributions * 10,
                  100
                )}
                %
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full"
                style={{
                  width: `${Math.min(
                    stats.contributions * 10,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>

        </div>

        {/* Interested Cultural Section */}
        <div className="border rounded-3xl p-6 bg-card mt-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            ❤️ Interested Cultural Areas
          </h3>
          
          {isEditing ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Select the cultural topics you are interested in:</p>
              <div className="flex flex-wrap gap-2">
                {CULTURAL_CATEGORIES.map((category) => {
                  const isSelected = editForm.interests.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleEditFormInterest(category)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <span>{getCategoryIcon(category)}</span>
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              {profile.interests && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((category) => (
                    <div
                      key={category}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm",
                        getCategoryColor(category)
                      )}
                    >
                      <span>{getCategoryIcon(category)}</span>
                      <span>{category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No categories selected yet. Edit profile to choose your interests.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats */}

        <div className="lg:col-span-2">

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-5">

            <div className="border rounded-3xl p-6 text-center">
  <h3 className="text-4xl font-bold">
    {stats.regions}
  </h3>

  <p className="text-muted-foreground mt-2">
    Regions
  </p>
</div>

<div className="border rounded-3xl p-6 text-center">
  <h3 className="text-4xl font-bold">
    {stats.heritageScore}
  </h3>

  <p className="text-muted-foreground mt-2">
    Heritage Score
  </p>
</div>

<div className="border rounded-3xl p-6 text-center">
  <h3 className="text-4xl font-bold">
    🔥 {stats.streak}
  </h3>

  <p className="text-muted-foreground mt-2">
    Streak
  </p>
</div>

            <div className="border rounded-3xl p-6 text-center">
              <h3 className="text-4xl font-bold">
                {stats.contributions}
              </h3>

              <p className="text-muted-foreground mt-2">
                Contributions
              </p>
            </div>

            <div className="border rounded-3xl p-6 text-center">
              <h3 className="text-4xl font-bold">
                {stats.likes}
              </h3>

              <p className="text-muted-foreground mt-2">
                Total Likes
              </p>
            </div>

            <div className="border rounded-3xl p-6 text-center">
              <h3 className="text-4xl font-bold">
                {stats.views}
              </h3>

              <p className="text-muted-foreground mt-2">
                Total Views
              </p>
            </div>

          </div>

          {/* Achievements */}

          <div className="border rounded-3xl p-6 mt-6">

            <h2 className="text-2xl font-bold mb-5">
              🏅 Achievements
            </h2>

            <div className="flex flex-wrap gap-3">

  {stats.contributions >= 1 && (
    <span className="bg-orange-500 text-white px-4 py-2 rounded-full">
      🏛 Cultural Explorer
    </span>
  )}

  {stats.contributions >= 5 && (
    <span className="bg-blue-500 text-white px-4 py-2 rounded-full">
      📖 Story Keeper
    </span>
  )}

  {stats.contributions >= 15 && (
    <span className="bg-green-500 text-white px-4 py-2 rounded-full">
      🌍 Heritage Guardian
    </span>
  )}

  {stats.contributions >= 30 && (
    <span className="bg-purple-500 text-white px-4 py-2 rounded-full">
      👑 Cultural Ambassador
    </span>
  )}

</div>

          </div>

        </div>

      </div>

      {/* Recent Contributions */}

      <div className="border rounded-3xl p-6 mt-8">

        <h2 className="text-3xl font-bold mb-6">
          📚 Recent Contributions
        </h2>

        <div className="space-y-4">

          {recentContributions.map(
            (item) => (
              <div
                key={item._id}
                className="border rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-xl">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground text-sm">
                    {item.category}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Just now"}</span>
                    <span>👁️ {item.views || 0}</span>
                    <span>❤️ {item.likes || 0}</span>
                    <span>💬 {item.commentsCount || 0}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/community-gallery/${item._id}`}
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    Open Page →
                  </Link>
                </div>
              </div>
            )
          )}

        </div>

      </div>

    </PageWrapper>
  );
}