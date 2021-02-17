import {ErrorException} from "@digichanges/shared-experience";
import {Locales} from "../../Application/app";

class UserDisabledException extends ErrorException
{
    constructor()
    {
        super(Locales.__('general.exceptions.userDisabled'), UserDisabledException.name);
    }
}

export default UserDisabledException;
