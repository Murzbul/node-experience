import { Filter } from '@digichanges/shared-experience';

class FileFilter extends Filter
{
    static readonly NAME: string = 'name';

    getFields(): any
    {
        return [
            FileFilter.NAME
        ];
    }

    getDefaultFilters(): any
    {
        return [];
    }
}

export default FileFilter;
