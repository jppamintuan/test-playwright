import { After, AfterAll, Before, BeforeAll, Status } from "@cucumber/cucumber";
import { APIRequestContext, Browser, BrowserContext, request } from "@playwright/test";
import { getEnv } from "../environment/env";
import { invokeBrowser } from "../helper/browserManager";
import { fixture } from "./fixture";
import { createLogger } from "winston";
import { options } from "../report/logger";
import fs = require("fs-extra");

let browser: Browser;
let context: BrowserContext;
let apiContext: APIRequestContext;

BeforeAll(async function () {
    getEnv();
    browser = await invokeBrowser();
});

Before(async function ({ pickle }) {
    const scenarioName = pickle.name + pickle.id

    context = await browser.newContext({
        recordVideo: {
            dir: "test-results/videos",
        },
    });

    await context.tracing.start({
        name: scenarioName,
        title: pickle.name,
        sources: true,
        screenshots: true, snapshots: true
    });

    apiContext = await request.newContext();
    const newPage = await context.newPage();
    fixture.page = newPage;
    fixture.api = apiContext;

    fixture.logger = createLogger(options(scenarioName));
});

After(async function ({ pickle, result }) {

    let videoPath: string;
    let img: Buffer;
    const path = `./test-results/trace/${pickle.id}.zip`;

    if (result?.status == Status.PASSED) {
        img = await fixture.page.screenshot(
            { path: `./test-results/screenshots/${pickle.name}.png`, type: "png" })
        videoPath = await fixture.page.video().path();
    }
    await context.tracing.stop({ path: path });

    await fixture.page.close();
    await context.close();

    if (result?.status == Status.PASSED) {
        await this.attach(
            img, "image/png"
        );
        await this.attach(
            fs.readFileSync(videoPath),
            'video/webm'
        );
        const traceFileLink = `<a href="https://trace.playwright.dev/">Open ${path}</a>`
        await this.attach(`Trace file: ${traceFileLink}`, 'text/html');

    }
});

AfterAll(async function () {
    await browser.close()
});