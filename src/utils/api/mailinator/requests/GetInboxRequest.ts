import {Inbox} from '../library/Inbox';
import {Sort} from '../library/Sort';
import {Request} from '../library/Request';
import {IRequestOptions, IRestResponse} from 'typed-rest-client/RestClient';
import restClient from '../library/MailinatorRestClient';
import {AUTHORIZATION} from '../library/Constants';

const _resolveTemplateUrl = (domain: string, inbox: string | undefined) => {
    if (inbox === undefined) {
        inbox = '';
    }
    return `https://api.mailinator.com/v2/domains/${domain}/inboxes/${inbox}`;
};

export class GetInboxRequest implements Request<Inbox> {

    constructor(private readonly domain: string,
                private readonly inbox?: string,
                private readonly skip?: number,
                private readonly limit?: number,
                private readonly sort?: Sort,
                private readonly decodeSubject?: boolean) {
    }

    execute(apiToken: string): Promise<IRestResponse<Inbox>> {

        const _options: IRequestOptions = {
            queryParameters: {
                params: {}
            },
            additionalHeaders: {
                [AUTHORIZATION]: apiToken
            }
        };

        if (this.skip !== undefined) {
            _options.queryParameters!.params['skip'] = this.skip
        }
        if (this.limit !== undefined) {
            _options.queryParameters!.params['limit'] = this.limit
        }
        if (this.sort !== undefined) {
            _options.queryParameters!.params['sort'] = this.sort
        }
        if (this.decodeSubject !== undefined) {
            _options.queryParameters!.params['decode_subject'] = this.decodeSubject.toString()
        }

        return restClient.get<Inbox>(_resolveTemplateUrl(this.domain, this.inbox), _options);
    }
}