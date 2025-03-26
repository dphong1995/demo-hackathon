import { test as base } from "@playwright/test";
import type { PlayWrightAiFixtureType } from "@midscene/web/playwright";
import { PlaywrightAiFixture } from "@midscene/web/playwright";

global.ReadableStream = require("web-streams-polyfill").ReadableStream;

export const test = base.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture());
