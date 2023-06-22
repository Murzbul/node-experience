import { SuperAgentTest } from 'supertest';
import initTestServer from '../../initTestServer';
import FilesystemFactory from '../../Shared/Factories/FilesystemFactory';
import { ILoginResponse } from '../../Shared/InterfaceAdapters/Tests/ILogin';
import { UploadFileBase64 } from './fixture';
import FilesystemMockRepository from './FilesystemMockRepository';
import { IFileResponse } from './types';
import ICreateConnection from '../../Shared/Infrastructure/Database/ICreateConnection';

describe('Start File Test', () =>
{
    let request: SuperAgentTest;
    let dbConnection: ICreateConnection;
    let token: string = null;
    let file_id = '';

    beforeAll(async() =>
    {
        const configServer = await initTestServer();

        request = configServer.request;
        dbConnection = configServer.dbConnection;

        jest.spyOn(FilesystemFactory, 'create').mockImplementation(() => new FilesystemMockRepository());
    });

    afterAll((async() =>
    {
        await dbConnection.drop();
        await dbConnection.close();
    }));

    describe('File Success', () =>
    {
        beforeAll(async() =>
        {
            const payload = {
                username: 'user@node.com',
                password: '12345678'
            };

            const response: ILoginResponse = await request
                .post('/api/auth/login?provider=local')
                .set('Accept', 'application/json')
                .send(payload);

            const { body: { data } } = response;

            token = data.accessToken;
        });

        test('Upload File /files/base64', async() =>
        {
            const response: IFileResponse = await request
                .post('/api/files/base64')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(UploadFileBase64);

            const { body: { data } } = response;

            expect(response.statusCode).toStrictEqual(201);
            expect(data.currentVersion).toStrictEqual(1);
            expect(data.versions.length).toStrictEqual(1);

            file_id = data.id;
        });

        test('Get File /files/metadata/:id', async() =>
        {
            const response = await request
                .get(`/api/files/metadata/${file_id}`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const { body: { data } } = response;

            expect(response.statusCode).toStrictEqual(200);
            expect(data.id).toStrictEqual(file_id);
        });

        test('Update File /file/base64/:id', async() =>
        {
            const response: IFileResponse = await request
                .put(`/api/files/base64/${file_id}`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(UploadFileBase64);

            const { body: { data } } = response;

            expect(response.statusCode).toStrictEqual(201);
            expect(data.currentVersion).toStrictEqual(2);
            expect(data.versions.length).toStrictEqual(2);
        });

        test('Get presigned File /file/presigned-get-object', async() =>
        {
            const response = await request
                .post('/api/files/presigned-get-object')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    file: `${file_id}`,
                    version: 1,
                    expiry: 241921
                });


            const { body: { data } } = response;

            expect(response.statusCode).toStrictEqual(200);
            expect(data.presignedGetObject).toBeDefined();
        });

        test('Get Files /files', async() =>
        {
            const response = await request
                .get('/api/files?pagination[limit]=30&pagination[offset]=0')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.statusCode).toStrictEqual(200);
        });

        test('Get Objects /files/objects', async() =>
        {
            const response = await request
                .get('/api/files/objects')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const { body: { data } } = response;

            expect(response.statusCode).toStrictEqual(200);
        });
    });

    describe('File Failed', () =>
    {
        beforeAll(async() =>
        {
            const payload = {
                username: 'user@node.com',
                password: '12345678'
            };

            const response: ILoginResponse = await request
                .post('/api/auth/login?provider=local')
                .set('Accept', 'application/json')
                .send(payload);

            const { body: { data } } = response;

            token = data.accessToken;
        });

        test('Upload File /files/base64', async() =>
        {
            const response: IFileResponse = await request
                .post('/api/files/base64')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.statusCode).toStrictEqual(500);
        });

        test('Get File /files/metadata/:id', async() =>
        {
            const response = await request
                .get('/api/files/metadata/123456')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const { body } = response;

            expect(response.statusCode).toStrictEqual(422);
            expect(body.message).toStrictEqual('Request Failed.');
            expect(body.errors[0].message).toStrictEqual('Invalid uuid');
        });

        test('Update File /file/base64/:id', async() =>
        {
            const response = await request
                .put('/api/files/base64/123456')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(UploadFileBase64);

            const { body } = response;

            expect(response.statusCode).toStrictEqual(422);
            expect(body.message).toStrictEqual('Request Failed.');
            expect(body.errors[0].message).toStrictEqual('Invalid uuid');
        });

        test('Get presigned File /file/presigned-get-object', async() =>
        {
            const response = await request
                .post('/api/files/presigned-get-object')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    file: '123456acd',
                    version: null,
                    expiry: 1
                });


            const { body } = response;

            expect(response.statusCode).toStrictEqual(422);
            expect(body.message).toStrictEqual('Request Failed.');
            expect(body.errors[0].message).toStrictEqual('Invalid uuid');
            expect(body.errors[1].message).toStrictEqual('Number must be greater than or equal to 241920');
            expect(body.errors[2].message).toStrictEqual('Expected number, received null');
        });
    });
});

