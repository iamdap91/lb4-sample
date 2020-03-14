import {Request, RestBindings, get, ResponseObject, post} from '@loopback/rest';
import {inject} from '@loopback/context';
import axios from 'axios';
import {Client} from '@elastic/elasticsearch';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {
  }

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @post('/axi', {
    responses: {
      '200': {
        description: 'es request function',
      },
    },
  })
  async axiRequest(): Promise<any> {
    const result = await axios.get('http://192.168.0.45:9200');
    console.log(result);
    return result;
  }

  @post('/es', {
    responses: {
      '200': {
        description: 'es request function',
      },
    },
  })
  async esRequest(): Promise<any> {
    const client = new Client({node: 'http://192.168.0.45:9200'});
    const result = await client.search({
      index: 'dti_health-20200211',
      // body: {foo: 'bar'},
    });

    return result.body;
  }

}
