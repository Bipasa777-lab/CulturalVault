import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Contribution from "@/models/Contribution";
import { connectDB } from "@/lib/mongodb";
import { MOCK_CONTRIBUTIONS } from "@/lib/mockData";

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

/* GET ALL CONTRIBUTIONS */

export async function GET() {
  try {
    const fetchContributionsPromise = (async () => {
      await connectDB();
      return await Contribution.find().sort({
        createdAt: -1,
      });
    })();

    const contributions = await withTimeout(fetchContributionsPromise, 1500, MOCK_CONTRIBUTIONS);

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Failed to fetch contributions from database, using fallback mock data:", error);
    return NextResponse.json(MOCK_CONTRIBUTIONS);
  }
}

/* CREATE CONTRIBUTION */

export async function POST(
  request: Request
) {
  try {
    await connectDB();

    const body =
      await request.json();

    const contribution =
      await Contribution.create({
        userId: body.userId || "",
        title: body.title,
        category: body.category,
        region: body.region,

        contributor:
          body.contributor || "",

        description:
          body.description || "",

        image:
          body.image || "",

        audio:
          body.audio || "",

        lat:
          body.lat || 0,

        lng:
          body.lng || 0,

        tags:
          body.tags || [],

        culturalEra:
          body.culturalEra || "",

        sourceType:
          body.sourceType || "",

        preservationStatus:
          body.preservationStatus ||
          "Active",

        importanceLevel:
          body.importanceLevel || "",

        heritageScore: 75,

        badge: "Explorer",

        inspiringVotes: 0,

        heritageVotes: 0,

        likes: 0,

        views: 0,

        verified: false,

        featured: false,

        status:
          "Pending Review",
      });

    return NextResponse.json(
      contribution,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create contribution",
      },
      {
        status: 500,
      }
    );
  }
}