import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { parseStringPromise } from "xml2js";
import { YoutubeTranscript } from "youtube-transcript";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const channelId = process.env.YOUTUBE_CHANNEL_ID;

async function sync() {
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  if (!channelId) {
    console.error("Missing YOUTUBE_CHANNEL_ID in .env.local");
    console.error("Please add your YouTube Channel ID (e.g. UCX6OQ3DkcsbYNE6H8uQQuVA) to .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  console.log(`Fetching RSS feed for channel: ${channelId}...`);
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  try {
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    
    const xml = await response.text();
    const result = await parseStringPromise(xml);
    
    if (!result.feed || !result.feed.entry) {
      console.log("No videos found in the RSS feed.");
      process.exit(0);
    }

    const entries = result.feed.entry;
    console.log(`Found ${entries.length} videos. Processing...`);

    const videosToUpsert = [];

    for (const entry of entries) {
      const videoId = entry['yt:videoId'][0];
      const title = entry.title[0];
      const publishedAt = entry.published[0];
      const mediaGroup = entry['media:group'][0];
      const description = mediaGroup['media:description'][0];
      const thumbnailUrl = mediaGroup['media:thumbnail'][0].$.url;

      console.log(`Processing video: ${title} (${videoId})`);
      
      let transcriptText = "";
      try {
        const transcriptLines = await YoutubeTranscript.fetchTranscript(videoId);
        transcriptText = transcriptLines.map((t) => t.text).join(" ");
        console.log(`  -> Successfully fetched transcript.`);
      } catch (err: unknown) {
        console.log(`  -> Could not fetch transcript: ${err instanceof Error ? err.message : String(err)}`);
      }

      videosToUpsert.push({
        id: videoId,
        title,
        description,
        transcript: transcriptText || null,
        published_at: publishedAt,
        thumbnail_url: thumbnailUrl,
      });
      
      // Delay slightly to prevent rate limits from YouTube Transcript API
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Upserting ${videosToUpsert.length} videos to Supabase...`);
    
    const { error } = await supabase.from("knowplain_videos").upsert(videosToUpsert, { onConflict: 'id' });

    if (error) {
      console.error("Error syncing to Supabase:", error);
      process.exit(1);
    }

    console.log("Successfully synced YouTube videos!");

  } catch (error) {
    console.error("Failed to sync videos:", error);
    process.exit(1);
  }
}

sync();
