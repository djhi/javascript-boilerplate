import bcrypt from 'bcrypt';
import config from 'config';

import { crud } from 'co-postgres-queries';

const tableName = 'user_account';

const fields = [
    'email',
    'password',
];
const exposedFields = [
    'id',
    ...fields,
];

const queriesFactory = crud(tableName, fields, ['id'], exposedFields);

export default client => {
    const queries = queriesFactory(client);

    const baseInsertOne = queries.insertOne;
    const baseBatchInsert = queries.batchInsert;

    queries.insertOne = function* insertOneQuery(user) {
        user.password = bcrypt.hashSync(user.password, config.apps.api.security.bcrypt.salt_work_factor);
        return yield baseInsertOne(user);
    };

    queries.batchInsert = function* batchInsertQuery(users) {
        const preparedUsers = users.map(user => {
            user.password = bcrypt.hashSync(user.password, config.apps.api.security.bcrypt.salt_work_factor);

            return user;
        });

        return yield baseBatchInsert(preparedUsers);
    };

    queries.findByEmail = function* findByEmail(email) {
        const sql = `
            SELECT ${exposedFields}
            FROM ${tableName}
            WHERE LOWER(email) = LOWER($email)
            LIMIT 1`;

        const results = yield client.query({
            sql,
            parameters: { email },
        });
        return results.length ? results[0] : null;
    };

    queries.authenticate = function* authenticate(email, password) {
        const foundUser = yield this.findByEmail(email);
        if (!foundUser || !bcrypt.compareSync(password, foundUser.password)) {
            return false;
        }
        return {
            id: foundUser.id,
            email: foundUser.email,
        };
    };

    return {
        tableName,
        exposedFields,
        ...queries,
    };
};
