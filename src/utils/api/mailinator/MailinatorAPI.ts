import { IRestResponse } from "typed-rest-client";
import { MailinatorClient } from "./library/MailinatorClient";
import { Inbox } from "./library/Inbox";
import { GetInboxRequest } from "./requests/GetInboxRequest";
import { GetMessageRequest } from "./requests/GetMessageRequest";
import { GetLinksRequest } from "./requests/GetLinksRequest";

let mailinatorClient: MailinatorClient;

export default class MailinatorAPI {

    // Create MailinatorClient
    async getMailinatorClient() {

        mailinatorClient = new MailinatorClient(process.env.MAIL_TOKEN);

    }

    // Get inbox from domain
    async getInboxFromDomain() {
        const response: IRestResponse<Inbox> = await mailinatorClient.request(
            new GetInboxRequest(process.env.MAIL_DOMAIN)
        );
        return response;
    }

    // Get paginated messages from domain and inbox
    async getMessagesFromDomainAndInbox(inboxName: string) {

        // inbox = inboxName;
        await this.getMailinatorClient();
        const response: IRestResponse<Inbox> = await mailinatorClient.request(
            new GetInboxRequest(process.env.MAIL_DOMAIN, inboxName)
        )
        return response;

    }

    // Get a particular message based on the message ID
    async getAMessageUsingMessageID(inboxName: string) {
        const response = await this.getMessagesFromDomainAndInbox(inboxName);
        const msg_id = response.result.msgs[0].id;
        const msg = await mailinatorClient.request(
            new GetMessageRequest(process.env.MAIL_DOMAIN, inboxName, msg_id)
        );
        return msg;
    }

    // Get a particular message based on the message ID
    async getAllLinksFromMessageUsingMessageID(inboxName: string) {

        const msg_id = (await this.getMessagesFromDomainAndInbox(inboxName)).result.msgs[0].id;
        const msg = await mailinatorClient.request(
            new GetLinksRequest(process.env.MAIL_DOMAIN, inboxName, msg_id)
        );
        return msg;

    }

    async getSignInLink(inboxName: string) {
        const signInLink = (await this.getAllLinksFromMessageUsingMessageID(inboxName)).result.links[1];
        return signInLink;
    }

}