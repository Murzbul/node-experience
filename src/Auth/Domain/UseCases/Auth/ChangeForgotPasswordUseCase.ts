import ChangeForgotPasswordPayload from '../../Payloads/Auth/ChangeForgotPasswordPayload';
import IUserRepository from '../../../Infrastructure/Repositories/User/IUserRepository';

import { REPOSITORIES } from '../../../../Config/Injects';
import Locales from '../../../../Shared/Utils/Locales';
import { ILocaleMessage } from '@digichanges/shared-experience';
import container from '../../../../register';
import AuthHelperService from '../../Services/AuthHelperService';
import ValidatorSchema from '../../../../Main/Presentation/Utils/ValidatorSchema';
import ChangeForgotPasswordSchemaValidation
    from '../../../Presentation/Validations/Auth/ChangeForgotPasswordSchemaValidation';

class ChangeForgotPasswordUseCase
{
    private repository: IUserRepository;
    private authHelperService: AuthHelperService;

    constructor()
    {
        this.authHelperService = new AuthHelperService();
        this.repository = container.resolve<IUserRepository>(REPOSITORIES.IUserRepository);
    }

    async handle(payload: ChangeForgotPasswordPayload): Promise<ILocaleMessage>
    {
        await ValidatorSchema.handle(ChangeForgotPasswordSchemaValidation, payload);

        const { password, confirmationToken } = payload;

        const decodeToken = this.authHelperService.validateToken(confirmationToken);
        const user = await this.repository.getOneByEmail(decodeToken.email);

        await this.repository.updatePassword(user.getId(), password);

        const locales = Locales.getInstance().getLocales();
        const key = 'auth.domain.messages.changeForgotPassword';

        return { message: locales.__(key), messageCode: key };
    }
}

export default ChangeForgotPasswordUseCase;
