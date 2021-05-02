import IdPayload from '../../../App/InterfaceAdapters/Payloads/IdPayload';
import IUserRepository from '../../InterfaceAdapters/IUserRepository';
import {REPOSITORIES} from '../../../repositories';
import {containerFactory} from '../../../App/Infrastructure/Factories/ContainerFactory';

class RemoveUserUseCase
{
    @containerFactory(REPOSITORIES.IUserRepository)
    private repository: IUserRepository;

    async handle(payload: IdPayload): Promise<any>
    {
        const id = payload.getId();
        return await this.repository.delete(id);
    }
}

export default RemoveUserUseCase;
