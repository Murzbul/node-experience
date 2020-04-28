import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ObjectIdColumn,
    ObjectID
} from "typeorm";

@Entity()
class User {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    firstName: string | undefined;

    @Column()
    lastName: string | undefined;

    @Column({unique: true})
    email: string | undefined;

    @Column()
    password: string | undefined;

    @Column()
    roles: string[];

    @Column()
    permissions: string[];

    @Column({ default: "true" })
    enable: boolean | undefined;

    @Column()
    confirmationToken: string | undefined;

    @Column()
    passwordRequestedAt: Date | undefined;

    @CreateDateColumn()
    createdAt: Date | undefined;

    @UpdateDateColumn()
    updatedAt: Date | undefined;
}

export default User;
