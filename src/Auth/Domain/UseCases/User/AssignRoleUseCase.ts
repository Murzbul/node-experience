import UserAssignRolePayload from '../../Payloads/User/UserAssignRolePayload';
import { REPOSITORIES } from '../../../../Config/Injects';
import IUserRepository from '../../../Infrastructure/Repositories/User/IUserRepository';
import container from '../../../../register';
import ValidatorSchema from '../../../../Main/Presentation/Utils/ValidatorSchema';
import UserAssignSchemaValidation from '../../../Presentation/Validations/User/UserAssignSchemaValidation';

class AssignRoleUseCase
{
    private repository: IUserRepository;

    constructor()
    {
        this.repository = container.resolve<IUserRepository>(REPOSITORIES.IUserRepository);
    }

    async handle(payload: UserAssignRolePayload): Promise<void>
    {
        await ValidatorSchema.handle(UserAssignSchemaValidation, payload);

        const { id } = payload;
        void await this.repository.getOne(id);

        await this.repository.assignRoles(payload);
    }
}

export default AssignRoleUseCase;
