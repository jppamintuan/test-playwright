import { APIRequestContext, Page } from "@playwright/test";
import { Logger } from "winston";

export const fixture = {
    page: undefined as Page,
    api: undefined as APIRequestContext,
    logger: undefined as Logger
}