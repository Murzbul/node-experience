import UserAssignRolePayload from '../../InterfaceAdapters/Payloads/UserAssignRolePayload';
import IUserRepository from '../../InterfaceAdapters/IUserRepository';
import {REPOSITORIES} from '../../../repositories';
import IUserDomain from '../../InterfaceAdapters/IUserDomain';
import IRoleRepository from '../../../Role/InterfaceAdapters/IRoleRepository';
import {containerFactory} from '../../../Shared/Decorators/ContainerFactory';

class AssignRoleUseCase
{
    @containerFactory(REPOSITORIES.IUserRepository)
    private repository: IUserRepository;

    @containerFactory(REPOSITORIES.IRoleRepository)
    private roleRepository: IRoleRepository;

    async handle(payload: UserAssignRolePayload): Promise<IUserDomain>
    {
        const id = payload.getId();
        const user: IUserDomain = await this.repository.getOne(id);

        user.clearRoles();

        for await (const roleId of payload.getRolesId())
        {
            const role = await this.roleRepository.getOne(roleId);
            user.setRole(role);
        }

        return await this.repository.save(user);
    }
}

export default AssignRoleUseCase;
