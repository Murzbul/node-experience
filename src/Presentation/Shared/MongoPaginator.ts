import IPaginator from "../../InterfaceAdapters/Shared/IPaginator";
import ICriteria from "../../InterfaceAdapters/Shared/ICriteria";
import IFilter from "../../InterfaceAdapters/Shared/IFilter";
import ISort from "../../InterfaceAdapters/Shared/ISort";
import IPagination from "../../InterfaceAdapters/Shared/IPagination";
import {DocumentQuery} from "mongoose";

class MongoPaginator implements IPaginator
{
    private documentQuery: DocumentQuery<any[], any>;
    private filter: IFilter;
    private sort: ISort;
    private pagination: IPagination;
    private total: number;

    constructor(documentQuery: DocumentQuery<any[], any>, criteria: ICriteria)
    {
        this.documentQuery = documentQuery;
        this.filter = criteria.getFilter();
        this.sort = criteria.getSort();
        this.pagination = criteria.getPagination();
    }

    public getTotal(): number
    {
        return this.total;
    }

    public getCurrentUrl(): string
    {
        return this.pagination.getCurrentUrl();
    }

    // TODO: Dont show next url when it doesnt exist more data
    public getNextUrl(): string
    {
        return this.pagination.getNextUrl();
    }

    public async paginate(): Promise<any>
    {
        // TODO: Add filter logic

        this.addOrderBy();
        this.addPagination();

        const data = await this.documentQuery.exec();

        this.total = data.length;

        return data;
    }

    public getExist(): boolean
    {
        return this.pagination.getExist();
    }
    // TODO: See when multiple sorts
    private addOrderBy()
    {
        let sorts = this.sort.get();

        sorts.forEach((value: string, key: string ) =>
        {
            let order: any = value.toUpperCase();
            order = (order === 'DESC') ? -1 : 1;

            const obj = {[key]: order};

            this.documentQuery.sort(obj);
        });
    }

    private addPagination()
    {
        const exist = this.pagination.getExist();

        if (exist)
        {
            this.documentQuery
                .skip(this.pagination.getOffset())
                .limit(this.pagination.getLimit());
        }
    }
}

export default MongoPaginator;
