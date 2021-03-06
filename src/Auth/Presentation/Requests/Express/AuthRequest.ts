import AuthPayload from '../../../InterfaceAdapters/Payloads/AuthPayload';
import Config from 'config';
import {IsString, IsEmail, Length} from 'class-validator';

class AuthRequest implements AuthPayload
{
    @IsEmail()
    email: string;

    @IsString()
    @Length(Config.get('validationSettings.password.min'), Config.get('validationSettings.password.max'))
    password: string;

    constructor(data: Record<string, any>)
    {
        this.email = data.email;
        this.password = data.password;
    }

    getEmail(): string
    {
        return this.email;
    }

    getPassword(): string
    {
        return this.password;
    }
}

export default AuthRequest;
