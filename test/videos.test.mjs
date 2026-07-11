import { test } from "node:test";
import assert from "node:assert/strict";
import { isoDurationToSeconds, timeToSeconds, videoClips } from "../src/lib/videos.ts";

test("timestamp parsing", () => {
  assert.equal(timeToSeconds("0:00"), 0);
  assert.equal(timeToSeconds("3:10"), 190);
  assert.equal(timeToSeconds("15:30"), 930);
  assert.equal(timeToSeconds("1:02:03"), 3723);
  // Garbage must not become a plausible-looking offset.
  assert.equal(timeToSeconds("abc"), 0);
  assert.equal(timeToSeconds("-5:00"), 0);
});

test("ISO 8601 duration parsing", () => {
  assert.equal(isoDurationToSeconds("PT18M"), 1080);
  assert.equal(isoDurationToSeconds("PT1H2M3S"), 3723);
  assert.equal(isoDurationToSeconds("PT45S"), 45);
  assert.equal(isoDurationToSeconds(undefined), undefined);
  assert.equal(isoDurationToSeconds("18 minutes"), undefined);
  assert.equal(isoDurationToSeconds("PT"), undefined);
});

const video = {
  id: "x",
  title: "T",
  description: "d",
  thumbnail_url: null,
  published_at: "2026-07-09",
  duration: "PT18M", // 1080s
  chapters: [
    { time: "0:00", title: "Intro", summary: "" },
    { time: "3:10", title: "Middle", summary: "" },
    { time: "15:30", title: "End", summary: "" },
  ],
};

test("chapters become key-moment clips that actually seek", () => {
  const clips = videoClips(video, "https://knowplain.com/watch/x");
  assert.equal(clips.length, 3);

  // Each clip ends where the next begins; the last runs to the video's duration.
  assert.deepEqual(
    clips.map((c) => [c.startOffset, c.endOffset]),
    [
      [0, 190],
      [190, 930],
      [930, 1080],
    ],
  );

  // Google will not show key moments it cannot link to — the URL must seek.
  assert.equal(clips[1].url, "https://knowplain.com/watch/x?t=190");
  assert.equal(clips[1].name, "Middle");
});

test("broken chapter data is dropped, not emitted as broken markup", () => {
  // Out of order: the second chapter goes backwards.
  const backwards = videoClips(
    { ...video, chapters: [
      { time: "5:00", title: "A", summary: "" },
      { time: "1:00", title: "B", summary: "" },
    ] },
    "https://knowplain.com/watch/x",
  );
  assert.equal(backwards.length, 1);
  assert.equal(backwards[0].name, "A");

  // A chapter starting after the video ends is nonsense.
  const overrun = videoClips(
    { ...video, chapters: [{ time: "99:00", title: "Nope", summary: "" }] },
    "https://knowplain.com/watch/x",
  );
  assert.equal(overrun.length, 0);

  // No chapters ⇒ no clips, not an empty-but-present hasPart.
  assert.deepEqual(videoClips({ ...video, chapters: [] }, "u"), []);
  assert.deepEqual(videoClips({ ...video, chapters: undefined }, "u"), []);
});
