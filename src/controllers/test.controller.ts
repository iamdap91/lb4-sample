import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, param, patch, post, put, requestBody} from '@loopback/rest';
import {Test} from '../models';
import {TestRepository} from '../repositories';
import {UserProfileSchema} from '../datasources/specs/user-controller.specs';
import {Client} from '@elastic/elasticsearch';

const esSchema = {
  type: 'object',
  // title: 'loopback.Count',
  properties: {
    took: {type: 'number'},
    timed_out: {type: 'boolean'},
    _shards: {type: 'Object'},
    hits: {type: 'Object'},
  },
};

export class TestController {
  constructor(
    @repository(TestRepository)
    public testRepository: TestRepository,
  ) {
  }

  @post('/tests', {
    responses: {
      '200': {
        description: 'Test model instance',
        content: {'application/json': {schema: getModelSchemaRef(Test)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Test, {
            title: 'NewTest',
            exclude: ['id'],
          }),
        },
      },
    })
      test: Omit<Test, 'id'>,
  ): Promise<Test> {
    return this.testRepository.create(test);
  }

  @get('/tests/count', {
    responses: {
      '200': {
        description: 'Test model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Test) where?: Where<Test>,
  ): Promise<Count> {
    return this.testRepository.count(where);
  }

  @get('/tests', {
    responses: {
      '200': {
        description: 'Array of Test model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Test, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Test) filter?: Filter<Test>,
  ): Promise<Test[]> {
    return this.testRepository.find(filter);
  }

  @patch('/tests', {
    responses: {
      '200': {
        description: 'Test PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Test, {partial: true}),
        },
      },
    })
      test: Test,
    @param.where(Test) where?: Where<Test>,
  ): Promise<Count> {
    return this.testRepository.updateAll(test, where);
  }

  @get('/tests/{id}', {
    responses: {
      '200': {
        description: 'Test model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Test, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Test, {exclude: 'where'}) filter?: FilterExcludingWhere<Test>,
  ): Promise<Test> {
    return this.testRepository.findById(id, filter);
  }

  @patch('/tests/{id}', {
    responses: {
      '204': {
        description: 'Test PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Test, {partial: true}),
        },
      },
    })
      test: Test,
  ): Promise<void> {
    await this.testRepository.updateById(id, test);
  }

  @put('/tests/{id}', {
    responses: {
      '204': {
        description: 'Test PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() test: Test,
  ): Promise<void> {
    await this.testRepository.replaceById(id, test);
  }

  @del('/tests/{id}', {
    responses: {
      '204': {
        description: 'Test DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.testRepository.deleteById(id);
  }

  @post('/test/esRequest', {
    responses: {
      '200': {
        description: 'Test esRequest method',
        content: {
          'application/json': {
            schema: esSchema,
          },
        },
      },
    },
  })
  async esRequest(
    @requestBody({description: 'query'}) query: Object,
  ): Promise<any> {
    return await elasticSearchRequest(query);
  };
}



const elasticSearchRequest = (query: Object) => new Promise(async (resolve, reject) => {
  const client = new Client({node: 'http://192.168.0.42:19200/'});
  // const testQuery = {
  // index: 'dti_result-20200319',
  // };
  const result = await client.search(query);
  resolve(result.body);
});


