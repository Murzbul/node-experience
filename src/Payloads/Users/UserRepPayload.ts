interface UserRepPayload {
    firstName(): string;
    lastName(): string;
    email(): string;
    password(): string;
    passwordConfirmation(): string;
    enable(): boolean;
    roles(): null;
    permissions(): null;
    confirmationToken(): null;
    passwordRequestedAt(): null;
}

export default UserRepPayload