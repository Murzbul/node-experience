import { IdPayload } from '@digichanges/shared-experience';
import IRoleDomain from '../../Entities/IRoleDomain';
import { REPOSITORIES } from '../../../../Config/Injects';
import IRoleRepository from '../../../Infrastructure/Repositories/Role/IRoleRepository';
import container from '../../../../register';
import ValidatorSchema from '../../../../Main/Presentation/Utils/ValidatorSchema';
import NameSchemaValidation from '../../../../Main/Presentation/Validations/NameSchemaValidation';

class GetRoleUseCase
{
    private repository: IRoleRepository;

    constructor()
    {
        this.repository = container.resolve<IRoleRepository>(REPOSITORIES.IRoleRepository);
    }

    async handle(payload: IdPayload): Promise<IRoleDomain>
    {
        await ValidatorSchema.handle(NameSchemaValidation, payload.id);

        return await this.repository.getOne(payload.id);
    }
}

export default GetRoleUseCase;
