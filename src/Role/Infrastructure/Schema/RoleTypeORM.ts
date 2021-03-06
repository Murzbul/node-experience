import {EntitySchema} from 'typeorm';
import Role from '../../Domain/Entities/Role';

const RoleSchema = new EntitySchema<Role>({
    name: 'Role',
    target: Role,
    tableName: 'roles',
    columns: {
        _id: {
            type: String,
            primary: true,
            unique: true
        },
        name: {
            type: String
        },
        slug: {
            type: String,
            unique: true
        },
        enable: {
            type: Boolean,
            default: true
        },
        ofSystem: {
            type: Boolean,
            default: false
        },
        permissions: {
            type: 'simple-array',
            nullable: true
        },
        createdAt: {
            name: 'createdAt',
            type: 'timestamp with time zone',
            createDate: true
        },
        updatedAt: {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            updateDate: true
        }
    }
});

export default RoleSchema;
