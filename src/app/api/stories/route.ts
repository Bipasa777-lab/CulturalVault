import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";
import { MOCK_STORIES } from "@/lib/mockData";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Database query timed out after ${timeoutMs}ms. Returning fallback mock data.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
}

export async function GET() {
  try {
    const fetchStoriesPromise = (async () => {
      await connectDB();
      return await Story.find();
    })();

    const stories = await withTimeout(fetchStoriesPromise, 1500, MOCK_STORIES);

    return NextResponse.json(stories);
  } catch (error: any) {
    console.error("Failed to fetch stories from database, using fallback mock data:", error);
    return NextResponse.json(MOCK_STORIES);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const story = await Story.create({
  userId: body.userId,
  userName: body.userName,

  title: body.title,
  region: body.region,
  language: body.language,
  narrator: body.narrator,
  category: body.category,
  score: body.score,
  lat: body.lat,
  lng: body.lng,
  description: body.description,
  audio: body.audio,
  image: body.image,
  gallery: body.gallery,
});

    return NextResponse.json(story);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save story" },
      { status: 500 }
    );
  }
}