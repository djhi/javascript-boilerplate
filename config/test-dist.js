const apiUrl = 'http://localhost:3010';
const frontendUrl = 'http://localhost:8081';
const allowedOrigins = [frontendUrl, apiUrl];

module.exports = {
    apps: {
        admin: {
            api_url: `${apiUrl}/admin/`,
        },
        api: {
            allowedOrigins,
            db: {
                database: 'travis_ci_test',
                host: 'localhost',
                password: '',
                user: 'postgres',
            },
            security: {
                xdomain: {
                    master: {
                        base_url: frontendUrl,
                    },
                },
            },
        },
        frontend: {
            api_url: `${apiUrl}/api`,
        },
    },
};
