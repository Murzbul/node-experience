import IUserDomain from '../../User/InterfaceAdapters/IUserDomain';

interface IToken
{
    getExpires(): number;
    getHash(): string;
    getUser(): IUserDomain;
}

export default IToken;
