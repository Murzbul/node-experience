
interface UserRepPayload
{
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    birthdate: Date;
    gender: string;
    phone: string;
    country: string;
    enable: boolean;
    emailVerified: boolean;
}

export default UserRepPayload;
