import RoleRepPayload from '../../InterfaceAdapters/Payloads/RoleRepPayload';
import IRoleDomain from '../../InterfaceAdapters/IRoleDomain';
import Role from '../Entities/Role';
import IRoleRepository from '../../InterfaceAdapters/IRoleRepository';
import { REPOSITORIES } from '../../../Config/repositories';
import { containerFactory } from '../../../Shared/Decorators/ContainerFactory';
import RoleUpdatePayload from '../../InterfaceAdapters/Payloads/RoleUpdatePayload';
import { ICriteria, IPaginator } from '@digichanges/shared-experience';
import IAuthService from '../../../Auth/InterfaceAdapters/IAuthService';
import { SERVICES } from '../../../services';


class RoleService
{
    @containerFactory(REPOSITORIES.IRoleRepository)
    private repository: IRoleRepository;

    @containerFactory(SERVICES.IAuthService)
    private authService: IAuthService;

    async persist(role: IRoleDomain, payload: RoleRepPayload): Promise<IRoleDomain>
    {
        this.authService.validatePermissions(payload.getPermissions());
        role.name = payload.getName();
        role.slug = payload.getSlug();
        role.enable = payload.getEnable();
        role.permissions = payload.getPermissions();

        return await this.repository.save(role);
    }

    async create(payload: RoleRepPayload): Promise<IRoleDomain>
    {
        const role = new Role();
        return await this.persist(role, payload);
    }

    async update(payload: RoleUpdatePayload): Promise<IRoleDomain>
    {
        const id = payload.getId();
        const role: IRoleDomain = await this.get_one(id);
        return await this.persist(role, payload);
    }

    async get_one(id: string): Promise<IRoleDomain>
    {
        return await this.repository.getOne(id);
    }

    async remove(id: string): Promise<IRoleDomain>
    {
        return await this.repository.delete(id);
    }

    async list(payload: ICriteria): Promise<IPaginator>
    {
        return await this.repository.list(payload);
    }
}

export default RoleService;
