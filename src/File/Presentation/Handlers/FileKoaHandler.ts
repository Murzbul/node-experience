import Koa from 'koa';
import Router from 'koa-router';
import MainConfig from '../../../Config/MainConfig';
import IPaginator from '../../../Shared/Infrastructure/Orm/IPaginator';
import KoaResponder from '../../../Shared/Application/Http/KoaResponder';
import FileVersionTransformer from '../Transformers/FileVersionTransformer';
import FileKoaReqMulterMiddleware from '../Middlewares/FileKoaReqMulterMiddleware';
import ObjectTransformer from '../Transformers/ObjectTransformer';
import AuthorizeKoaMiddleware from '../../../Auth/Presentation/Middlewares/AuthorizeKoaMiddleware';
import Permissions from '../../../Config/Permissions';
import FileTransformer from '../Transformers/FileTransformer';
import ICriteria from '../../../Shared/Presentation/Requests/ICriteria';
import RequestCriteria from '../../../Shared/Presentation/Requests/RequestCriteria';
import FileFilter from '../Criterias/FileFilter';
import FileSort from '../Criterias/FileSort';
import Pagination from '../../../Shared/Presentation/Shared/Pagination';
import ListFilesUseCase from '../../Domain/UseCases/ListFilesUseCase';
import ListObjectsUseCase from '../../Domain/UseCases/ListObjectsUseCase';
import GetFileMetadataUserCase from '../../Domain/UseCases/GetFileMetadataUseCase';
import ValidatorSchema from '../../../Shared/Presentation/Shared/ValidatorSchema';
import FileBase64RepPayload from '../../Domain/Payloads/FileBase64RepPayload';
import FileBase64SchemaValidation from '../Validations/FileBase64SchemaValidation';
import UploadBase64UseCase from '../../Domain/UseCases/UploadBase64UseCase';
import UploadMultipartUseCase from '../../Domain/UseCases/UploadMultipartUseCase';
import GetPresignedGetObjectUseCase from '../../Domain/UseCases/GetPresignedGetObjectUseCase';
import PresignedFileRepPayload from '../../Domain/Payloads/PresignedFileRepPayload';
import DownloadUseCase from '../../Domain/UseCases/DownloadUseCase';
import OptimizeUseCase from '../../Domain/UseCases/OptimizeUseCase';
import UpdateFileBase64UseCase from '../../Domain/UseCases/UpdateFileBase64UseCase';
import IFileDTO from '../../Domain/Models/IFileDTO';
import FileUpdateBase64Payload from '../../Domain/Payloads/FileUpdateBase64Payload';
import UpdateFileMultipartUseCase from '../../Domain/UseCases/UpdateFileMultipartUseCase';
import RemoveFileUseCase from '../../Domain/UseCases/RemoveFileUseCase';

const routerOpts: Router.IRouterOptions = {
    prefix: '/api/files'
};

const FileKoaHandler: Router = new Router(routerOpts);
const responder: KoaResponder = new KoaResponder();
const config = MainConfig.getInstance().getConfig().statusCode;

FileKoaHandler.get('/', AuthorizeKoaMiddleware(Permissions.FILES_LIST), async(ctx: Koa.ParameterizedContext & any) =>
{
    const { query, url } = ctx.request;

    const requestCriteria: ICriteria = new RequestCriteria(
        {
            filter: new FileFilter(query),
            sort: new FileSort(query),
            pagination: new Pagination(query, url)
        });

    const useCase = new ListFilesUseCase();
    const paginator: IPaginator = await useCase.handle(requestCriteria);

    await responder.paginate(paginator, ctx, config['HTTP_OK'], new FileVersionTransformer());
});

FileKoaHandler.get('/objects', AuthorizeKoaMiddleware(Permissions.FILES_LIST), async(ctx: Koa.ParameterizedContext & any) =>
{
    const { query } = ctx.request;

    const payload = {
        ...query,
        recursive: query.recursive ? String(query.recursive) : undefined,
        prefix: query.prefix ? String(query.prefix) : undefined
    };

    const useCase = new ListObjectsUseCase();
    const objects = await useCase.handle(payload);

    void await responder.send(objects, ctx, config['HTTP_OK'], new ObjectTransformer());
});

FileKoaHandler.get('/metadata/:id', AuthorizeKoaMiddleware(Permissions.FILES_SHOW_METADATA), async(ctx: Koa.ParameterizedContext & any) =>
{
    const payload = {
        id: ctx.params.id
    };

    const useCase = new GetFileMetadataUserCase();
    const file = await useCase.handle(payload);

    void await responder.send(file, ctx, config['HTTP_OK'], new FileTransformer());
});

FileKoaHandler.post('/base64', AuthorizeKoaMiddleware(Permissions.FILES_UPLOAD), async(ctx: Koa.ParameterizedContext & any) =>
{
    const { filename, base64 } = ctx.request.body;
    const partialBase64 = base64.split(';base64,');
    const _base64: string = partialBase64.pop();
    const mimeType = partialBase64.shift().split('data:').pop();
    const extension = filename.includes('.') ? filename.split('.').pop() : null;
    const { length } = Buffer.from(_base64.substring(_base64.indexOf(',') + 1));

    const payload = {
        ...ctx.request.body,
        query: ctx.query,
        originalName: filename,
        base64: _base64,
        mimeType,
        extension,
        size: length,
        isImage: mimeType.includes('image')
    };

    const cleanData = await ValidatorSchema.handle<FileBase64RepPayload>(FileBase64SchemaValidation, payload);

    const useCase = new UploadBase64UseCase();
    const file = await useCase.handle(cleanData as FileBase64RepPayload);

    void await responder.send(file, ctx, config['HTTP_CREATED'], new FileTransformer());
});

FileKoaHandler.post('/', <any>FileKoaReqMulterMiddleware.single('file'), AuthorizeKoaMiddleware(Permissions.FILES_UPLOAD), async(ctx: Koa.ParameterizedContext & any) =>
{
    // TODO: Refactor
    const { originalname, encoding, mimetype, destination, filename, size } = ctx.request.file;
    const { isOriginalName, isPublic, isOverwrite, isOptimize } = ctx.request.query;

    const payload = {
        file: {
            originalName: originalname,
            mimeType: mimetype,
            destination,
            extension: originalname.includes('.') ? originalname.split('.').pop() : '',
            filename,
            path: '/',
            size,
            encoding,
            isImage: mimetype.includes('image')
        },
        query: {
            isOriginalName: isOriginalName === 'true',
            isPublic: isPublic === 'true',
            isOverwrite: isOverwrite === 'true',
            isOptimize: isOptimize === 'true'
        }
    };

    const useCase = new UploadMultipartUseCase();
    const file = await useCase.handle(payload);

    void await responder.send(file, ctx, config['HTTP_CREATED'], new FileTransformer());
});

FileKoaHandler.post('/presigned-get-object', AuthorizeKoaMiddleware(Permissions.FILES_DOWNLOAD), async(ctx: Koa.ParameterizedContext & any) =>
{
    const payload: PresignedFileRepPayload = {
        ...ctx.request.body,
        query: ctx.query
    };

    const useCase = new GetPresignedGetObjectUseCase();
    const presignedGetObject = await useCase.handle(payload);

    void await responder.send({ presignedGetObject }, ctx, config['HTTP_OK'], null);
});

FileKoaHandler.get('/:id', AuthorizeKoaMiddleware(Permissions.FILES_DOWNLOAD), async(ctx: Koa.ParameterizedContext) =>
{
    const payload = {
        id: ctx.params.id,
        version: ctx.query?.version ? +ctx.query.version : null
    };

    const useCase = new DownloadUseCase();
    const fileDto =  await useCase.handle(payload);

    responder.sendStream(fileDto, ctx, config['HTTP_OK']);
});

FileKoaHandler.put('/optimize/:id', AuthorizeKoaMiddleware(Permissions.FILES_DELETE), async(ctx: Koa.ParameterizedContext) =>
{
    const payload = {
        id: ctx.params.id,
        ...ctx.query as any
    };

    const useCase = new OptimizeUseCase();
    const file =  await useCase.handle(payload);

    void await responder.send(file, ctx, config['HTTP_CREATED'], new FileTransformer());
});

FileKoaHandler.put('/base64/:id', AuthorizeKoaMiddleware(Permissions.FILES_UPDATE), async(ctx: Koa.ParameterizedContext & any) =>
{
    const { filename, base64 } = ctx.request.body;
    const partialBase64 = base64.split(';base64,');
    const _base64: string = partialBase64.pop();
    const mimeType = partialBase64.shift().split('data:').pop();
    const extension = filename.includes('.') ? filename.split('.').pop() : null;
    const { length } = Buffer.from(_base64.substring(_base64.indexOf(',') + 1));

    const payload: FileUpdateBase64Payload = {
        ...ctx.request.body,
        id: ctx.params.id,
        query: ctx.query,
        originalName: ctx.request.body.filename as string,
        base64: _base64,
        mimeType,
        extension,
        size: length,
        isImage: mimeType.includes('image')
    };

    const useCase = new UpdateFileBase64UseCase();
    const file: IFileDTO = await useCase.handle(payload);

    void await responder.send(file, ctx, config['HTTP_CREATED'], new FileTransformer());
});

FileKoaHandler.put('/:id', <any>FileKoaReqMulterMiddleware.single('file'), AuthorizeKoaMiddleware(Permissions.FILES_UPDATE), async(ctx: Koa.ParameterizedContext) =>
{
    const { originalname, encoding, mimetype, destination, filename, size } = ctx.request.file;
    const { isOriginalName, isPublic, isOverwrite, isOptimize } = ctx.request.query;

    const payload = {
        id: ctx.params.id,
        file: {
            originalName: originalname,
            mimeType: mimetype,
            destination,
            extension: originalname.includes('.') ? originalname.split('.').pop() : '',
            filename,
            path: '/',
            size,
            encoding,
            isImage: mimetype.includes('image')
        },
        query: {
            isOriginalName: isOriginalName === 'true',
            isPublic: isPublic === 'true',
            isOverwrite: isOverwrite === 'true',
            isOptimize: isOptimize === 'true'
        }
    };

    const useCase = new UpdateFileMultipartUseCase();
    const response = await useCase.handle(payload);

    void await responder.send(response, ctx, config['HTTP_CREATED'], new FileTransformer());
});

FileKoaHandler.delete('/:id', AuthorizeKoaMiddleware(Permissions.FILES_DELETE), async(ctx: Koa.ParameterizedContext) =>
{
    const payload = {
        id: ctx.params.id
    };

    const useCase = new RemoveFileUseCase();
    const file = await useCase.handle(payload);

    void await responder.send(file, ctx, config['HTTP_CREATED'], new FileTransformer());
});

export default FileKoaHandler;
