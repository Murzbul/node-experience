import Koa from 'koa';
import Router from 'koa-router';
import { IPaginator, StatusCode } from '@digichanges/shared-experience';
import Responder from '../../../../App/Presentation/Shared/Koa/Responder';
import ItemController from '../../Controllers/ItemController';
import ItemTransformer from '../../Transformers/ItemTransformer';
import ItemRepRequest from '../../Requests/ItemRepRequest';
import { AuthUser } from '../../../../Auth/Presentation/Helpers/AuthUser';
import IUserDomain from '../../../../User/InterfaceAdapters/IUserDomain';
import IItemDomain from '../../../InterfaceAdapters/IItemDomain';
import IdRequest from '../../../../App/Presentation/Requests/Express/IdRequest';
import ItemRequestCriteria from '../../Requests/ItemRequestCriteria';
import ItemUpdateRequest from '../../Requests/ItemUpdateRequest';

const routerOpts: Router.IRouterOptions = {
    prefix: '/api/items'
};

const ItemHandler: Router = new Router(routerOpts);
const responder: Responder = new Responder();
const controller: ItemController = new ItemController();

ItemHandler.post('/', async(ctx: Koa.Context) =>
{
    const request = new ItemRepRequest(ctx.request.body);

    const item: IItemDomain = await controller.save(request, AuthUser(ctx.request.req) as IUserDomain);

    responder.send(item, ctx, StatusCode.HTTP_CREATED, new ItemTransformer());
});

ItemHandler.get('/', async(ctx: Koa.Context) =>
{
    const _request = new ItemRequestCriteria(ctx.request.query, ctx.request.url);

    const paginator: IPaginator = await controller.list(_request);

    await responder.paginate(paginator, ctx, StatusCode.HTTP_OK, new ItemTransformer());
});

ItemHandler.get('/:id', async(ctx: Koa.Context) =>
{
    const _request = new IdRequest(ctx.params.id);

    const item: IItemDomain = await controller.getOne(_request);

    responder.send(item, ctx, StatusCode.HTTP_OK, new ItemTransformer());
});

ItemHandler.put('/:id', async(ctx: Koa.Context) =>
{
    const _request = new ItemUpdateRequest(ctx.request.body, ctx.params.id);

    const item: IItemDomain = await controller.update(_request, AuthUser(ctx.request.req) as IUserDomain);

    responder.send(item, ctx, StatusCode.HTTP_OK, new ItemTransformer());
});

ItemHandler.delete('/:id', async(ctx: Koa.Context) =>
{
    const _request = new IdRequest(ctx.params.id);

    const item: IItemDomain = await controller.remove(_request);

    responder.send(item, ctx, StatusCode.HTTP_OK, new ItemTransformer());
});

export default ItemHandler;
