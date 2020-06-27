import Role from '../../Infrastructure/Entities/Role';
import {inject, injectable} from 'inversify';
import IdPayload from "../../InterfaceAdapters/Payloads/Defaults/IdPayload";
import RoleRepPayload from "../../InterfaceAdapters/Payloads/Roles/RoleRepPayload";
import RoleUpdatePayload from "../../InterfaceAdapters/Payloads/Roles/RoleUpdatePayload";
import {REPOSITORIES} from "../../repositories";
import IRoleRepository from "../../InterfaceAdapters/IRepositories/IRoleRepository";
import ICriteria from "../../Lib/Contracts/ICriteria";
import IRoleService from "../../InterfaceAdapters/IServices/IRoleService";
import IEncryptionStrategy from "../../Lib/Encryption/IEncryptionStrategy";
import EncryptionFactory from "../../Lib/Factories/EncryptionFactory";
import IRole from "../../InterfaceAdapters/IEntities/IRole";

@injectable()
class RoleService implements IRoleService
{
    private repository: IRoleRepository;
    private encryption: IEncryptionStrategy;

    constructor(@inject(REPOSITORIES.IRoleRepository) repository: IRoleRepository)
    {
        this.repository = repository;
        this.encryption = EncryptionFactory.create();
    }

    public async save (payload: RoleRepPayload): Promise<IRole>
    {
        const role = new Role();
        role.name = payload.name();
        role.slug = payload.slug();
        role.permissions = payload.permissions();
        role.enable = payload.enable();

        await this.repository.save(role);

        return role;
    }

    public async update (payload: RoleUpdatePayload): Promise<IRole>
    {
        const id = payload.id();
        let role: IRole = await this.repository.findOne(id);

        role.name = payload.name();
        role.slug = payload.slug();
        role.permissions = payload.permissions();
        role.enable = payload.enable();

        await this.repository.save(role);

        return role;
    }

    public async list (criteria: ICriteria)
    {
        return await this.repository.list(criteria);
    }

    public async getOne (payload: IdPayload): Promise<IRole>
    {
        const id = payload.id();
        return await this.repository.findOne(id);
    }

    public async remove (payload: IdPayload): Promise<any>
    {
        const id = payload.id();
        return await this.repository.delete(id);
    }
}

export default RoleService;