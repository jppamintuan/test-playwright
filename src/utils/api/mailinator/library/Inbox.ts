import {Message} from '../requests/Message';

export class Inbox {
    domain: string;
    to: string;
    msgs: Array<Message>;
}