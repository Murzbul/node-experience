import { ErrorHttpException } from './ErrorHttpException';
import { StatusCode } from '../Application/StatusCode';

class DuplicateEntityHttpException extends ErrorHttpException
{
    constructor()
    {
        const key = 'app.presentation.exceptions.duplicateEntity';
        super(StatusCode.HTTP_BAD_REQUEST, {
            message: 'Duplicate entity.',
            errorCode: key
        });
    }
}

export default DuplicateEntityHttpException;
