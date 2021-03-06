import IUserRepository from '../../InterfaceAdapters/IUserRepository';
import User from '../../Domain/Entities/User';
import {injectable} from 'inversify';
import {ICriteria, IPaginator} from '@digichanges/shared-experience';

import Paginator from '../../../App/Presentation/Shared/Paginator';
import UserFilter from '../../Presentation/Criterias/UserFilter';
import IUserDomain from '../../InterfaceAdapters/IUserDomain';
import UserSchema from '../Schema/UserTypeORM';

import NotFoundException from '../../../Shared/Exceptions/NotFoundException';
import BaseSqlRepository from '../../../App/Infrastructure/Repositories/BaseSqlRepository';

@injectable()
class UserSqlRepository extends BaseSqlRepository<IUserDomain> implements IUserRepository
{
    constructor()
    {
        super(User.name, UserSchema);
    }

    async getOneByEmail(email: string): Promise<IUserDomain>
    {
        const user = await this.repository.findOne({email});

        if (!user)
        {
            throw new NotFoundException(User.name);
        }

        return user;
    }

    async getOneByConfirmationToken(confirmationToken: string): Promise<IUserDomain>
    {
        const user = await this.repository.findOne({confirmationToken});

        if (!user)
        {
            throw new NotFoundException(User.name);
        }

        return user;
    }

    async list(criteria: ICriteria): Promise<IPaginator>
    {
        const queryBuilder = this.repository.createQueryBuilder('i');

        const filter = criteria.getFilter();

        queryBuilder.where('1 = 1');

        if (filter.has(UserFilter.ENABLE))
        {
            queryBuilder.andWhere(`i.${UserFilter.ENABLE} = :${UserFilter.ENABLE}`);
            queryBuilder.setParameter(UserFilter.ENABLE, filter.get(UserFilter.ENABLE));
        }

        if (filter.has(UserFilter.EMAIL))
        {
            queryBuilder.andWhere(`i.${UserFilter.EMAIL} like :${UserFilter.EMAIL}`);
            queryBuilder.setParameter(UserFilter.EMAIL, `%${filter.get(UserFilter.EMAIL)}%`);
        }

        queryBuilder.leftJoinAndSelect('i.roles', 'role');

        return new Paginator(queryBuilder, criteria);
    }
}

export default UserSqlRepository;
