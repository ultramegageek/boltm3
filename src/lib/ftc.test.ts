import { describe, it, expect } from "vitest";
import { readiness, matchStats, AWARDS, EVENTS } from "./ftc";

describe("ftc rules", () => {
  it("has all 11 awards", () => expect(AWARDS).toHaveLength(11));
  it("has 8 events", () => expect(EVENTS).toHaveLength(8));
  it("match total high and average", () => {
    const s = matchStats([
      { auto_score: 10, teleop_score: 20, endgame_score: 5 },
      { auto_score: 20, teleop_score: 30, endgame_score: 10 },
    ]);
    expect(s.high).toBe(60);
    expect(s.average).toBe(47.5);
  });
  it("readiness 100 when all done and ready", () => {
    expect(readiness([{ status: "done" }], [{ status: "ready" }])).toBe(100);
  });
});
