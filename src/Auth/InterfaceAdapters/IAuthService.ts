import IUserDomain from '../../User/InterfaceAdapters/IUserDomain';

interface IAuthService
{
    decodeToken (token: string): any; // TODO: Add type
    getPermissions(user: IUserDomain): string[]
    validatePermissions(permissions: string[]): void
}

export default IAuthService;
