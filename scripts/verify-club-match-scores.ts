import assert from "node:assert/strict";
import { clubGoalsFromMatch, homeAwayScoresFromClubGoals } from "../lib/club-match-scores";
import { buildClubMatchJsonContext } from "../lib/match-center/club-match-json";
import { parseMatchEventsJson, serializeMatchEvents } from "../lib/match-center/parse-match-json";
import { RAI_TEAM_ID } from "../data/mock";

const clubIds = [RAI_TEAM_ID, "real-aviles-industrial"];

const awayLoss = {
  homeTeamId: "sd-mosconia",
  awayTeamId: RAI_TEAM_ID,
  homeTeam: "SD Mosconia",
  awayTeam: "Real Avilés",
  homeScore: 2,
  awayScore: 0,
};

const goals = clubGoalsFromMatch(awayLoss, clubIds);
assert.ok(goals);
assert.equal(goals.clubGoals, 0);
assert.equal(goals.rivalGoals, 2);
assert.equal(goals.isClubHome, false);

const mapped = homeAwayScoresFromClubGoals(0, 2, false);
assert.deepEqual(mapped, { homeScore: 2, awayScore: 0 });

const context = buildClubMatchJsonContext(awayLoss.homeTeamId, awayLoss.awayTeamId, "masculino", clubIds);
assert.ok(context);
assert.equal(context.rivalKey, "local");

const eventsJson = `[
  { "minute": 12, "type": "goal", "team": "aviles", "dorsal": 9, "player": "Test" },
  { "minute": 34, "type": "penalti", "team": "local", "player": "Rival" }
]`;
const parsed = parseMatchEventsJson(eventsJson, [], context);
assert.equal(parsed.ok, true);
if (parsed.ok) {
  assert.equal(parsed.data[0]?.team, "away");
  assert.equal(parsed.data[1]?.team, "home");
  assert.equal(parsed.data[1]?.type, "goal_penalty");
  const serialized = serializeMatchEvents(parsed.data, context);
  assert.match(serialized, /"team": "aviles"/);
  assert.match(serialized, /"team": "local"/);
}

console.log("verify-club-match-scores: ok");
