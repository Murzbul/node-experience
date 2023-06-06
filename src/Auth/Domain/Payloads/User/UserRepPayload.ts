
interface UserRepPayload
{
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    birthdate: string;
    genre: string;
    phone: string;
    country: string;
    enable: boolean;
    emailVerified: boolean;
}

export default UserRepPayload;
