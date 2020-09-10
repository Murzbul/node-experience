import * as express from 'express';
import DownloadPayload from '../../../InterfaceAdapters/Payloads/FileSystem/DownloadPayload';
import {param} from "express-validator";

class DownloadRequest implements DownloadPayload
{
    private request: express.Request;

    constructor(request: express.Request)
    {
        this.request = request;
    }

    filename(): string
    {
        return this.request.params.filename;
    }

    static validate()
    {
        return [
            param('filename')
                .exists().withMessage('filename must exist')
        ];
    }
    
}

export default DownloadRequest;