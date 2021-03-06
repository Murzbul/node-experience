import {injectable} from 'inversify';
import jwt, {TAlgorithm} from 'jwt-simple';
import _ from 'lodash/fp';
import Config from 'config';

import EncryptionFactory from '../../Shared/Factories/EncryptionFactory';
import IAuthService from '../InterfaceAdapters/IAuthService';
import IUserDomain from '../../User/InterfaceAdapters/IUserDomain';
import Permissions from '../../Config/Permissions';
import WrongPermissionsException from '../Domain/Exceptions/WrongPermissionsException';
import {IEncryption} from '@digichanges/shared-experience';
import ITokenDecode from '../../Shared/InterfaceAdapters/ITokenDecode';

@injectable()
class AuthService implements IAuthService
{
    private encryption: IEncryption;

    constructor()
    {
        this.encryption = EncryptionFactory.create();
    }

    public decodeToken(token: string): ITokenDecode
    {
        const TokenArray = token.split(' ');

        const secret: string = Config.get('jwt.secret');
        const algorithm: TAlgorithm = Config.get('encryption.bcrypt.algorithm');

        return jwt.decode(TokenArray[1], secret, false, algorithm);
    }

    public getPermissions(user: IUserDomain): string[]
    {
        const rolePermissions = user.getRoles().filter(role => role.enable).reduce((accum, role) =>
        {
            return [...accum, ...role.permissions];
        }, []);

        return [...new Set([...user.permissions, ...rolePermissions])];
    }

    public validatePermissions(permissions: string[]): void
    {
        if (!_.isEmpty(permissions) && _.isEmpty(_.intersection(permissions, Permissions.permissions())))
        {
            throw new WrongPermissionsException();
        }
    }
}

export default AuthService;
