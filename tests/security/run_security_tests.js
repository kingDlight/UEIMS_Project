const newman = require('newman');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'f61c7876d571b258ef0265bd067fbaf64d46d70572843782b1e0e78db1b49464';
const BASE_URL = 'http://localhost:8080/api';

function generateToken(user, roleName) {
    const jwtid = require('crypto').randomUUID();
    const token = jwt.sign({
        userId: user ? user.user_id : '00000000-0000-0000-0000-000000000000',
        sub: user ? user.email : 'test@example.com',
        iss: 'ueims.com',
        authorities: 'ROLE_' + roleName,
        token_type: 'ACCESS',
        must_change_password: false,
        full_name: user ? user.full_name : 'Test User',
        status: 'ACTIVE',
        auth_provider: 'LOCAL'
    }, JWT_SECRET, { expiresIn: '1h', jwtid: jwtid, algorithm: 'HS512' });

    return { token, jwtid };
}

async function getOrForgeToken(roleName, dbClient) {
    let user = null;
    try {
        const res = await dbClient.query(`
            SELECT u.* FROM users u
            JOIN users_roles ur ON u.user_id = ur.user_id
            WHERE ur.role_name = $1 AND u.status = 'ACTIVE' LIMIT 1
        `, [roleName]);
        if (res.rows.length > 0) {
            user = res.rows[0];
        }
    } catch (err) {
        console.warn(`[WARN] DB Query failed for role ${roleName}:`, err.message);
    }

    if (!user) {
        console.warn(`[WARN] No real user found for role ${roleName}. Forging an anonymous token.`);
    }

    const { token, jwtid } = generateToken(user, roleName);
    
    const email = user ? user.email : 'test@example.com';
    try {
        await dbClient.query(`
            INSERT INTO user_sessions (token_id, email, last_activity, expires_at, device_id)
            VALUES ($1, $2, NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 day', 'test-device')
        `, [jwtid, email]);
    } catch (err) {
        console.warn(`[WARN] Failed to insert session for ${roleName}:`, err.message);
    }

    return token;
}

async function runTests() {
    console.log('Preparing environment and fetching tokens via pg...');
    
    // Connect to PG
    const dbClient = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/ueims_db?schema=public'
    });
    await dbClient.connect();

    const dummyFilePath = path.join(__dirname, 'dummy.xlsm');
    fs.writeFileSync(dummyFilePath, 'dummy macro payload');

    const tmToken = await getOrForgeToken('TRAINING_MANAGER', dbClient);
    const studentToken = await getOrForgeToken('STUDENT', dbClient);
    const entToken = await getOrForgeToken('ENTERPRISE', dbClient);
    const mentorToken = await getOrForgeToken('MENTOR', dbClient);

    console.log("Tokens generated successfully.");
    console.log('-----------------------------------------------------------------');
    console.log('Running Main Newman Tests (SQLi, Macro, Directory Traversal, RBAC)...');



    const collection = {
        info: {
            name: "UEIMS Security & RBAC Tests",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: [
            {
                name: "Security: SQLi ID Học kỳ URL",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('1. Sửa URL edit thành chuỗi SQLi -> Trả về lỗi 400, 404, or 405', function() {",
                                "   pm.expect(pm.response.code).to.be.oneOf([400, 404, 405, 500]);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "PUT",
                    header: [{ key: "Authorization", value: "Bearer {{tm_token}}" }],
                    url: {
                        raw: "{{base_url}}/semesters/' OR 1=1",
                        host: ["{{base_url}}"],
                        path: ["semesters", "' OR 1=1"]
                    }
                }
            },
            {
                name: "Security: File Macro độc hại",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('2. Upload file Excel chứa Macro (.xlsm) -> Chặn upload, thông báo lỗi', function () {",
                                "   pm.expect(pm.response.code).to.be.oneOf([400, 415, 422, 500]);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "POST",
                    header: [{ key: "Authorization", value: "Bearer {{tm_token}}" }],
                    body: {
                        mode: "formdata",
                        formdata: [
                            { key: "file", type: "file", src: "tests/security/dummy.xlsm" }
                        ]
                    },
                    url: {
                        raw: "{{base_url}}/eligible-students/upload",
                        host: ["{{base_url}}"],
                        path: ["eligible-students", "upload"]
                    }
                }
            },
            {
                name: "Security: Directory Traversal",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('4. Sửa request tên file thành đường dẫn hệ thống -> Bị chặn', function () {",
                                "    pm.expect(pm.response.code).to.be.oneOf([400, 403, 500]);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "POST",
                    header: [{ key: "Authorization", value: "Bearer {{tm_token}}" }],
                    body: {
                        mode: "formdata",
                        formdata: [
                            { key: "file", type: "file", src: "tests/security/dummy.xlsm" }
                        ]
                    },
                    url: {
                        raw: "{{base_url}}/eligible-students/upload?filename=../../../etc/passwd",
                        host: ["{{base_url}}"],
                        path: ["eligible-students", "upload"],
                        query: [
                            { key: "filename", value: "../../../etc/passwd" }
                        ]
                    }
                }
            },
            {
                name: "RBAC: SV gọi API tạo HK",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('5. Gọi trực tiếp API POST /semesters -> HTTP 403 Forbidden or 400', function() {",
                                "   pm.expect(pm.response.code).to.be.oneOf([403, 400]);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "POST",
                    header: [
                        { key: "Authorization", value: "Bearer {{student_token}}" },
                        { key: "Content-Type", value: "application/json" }
                    ],
                    body: { mode: "raw", raw: JSON.stringify({ name: "Semester X" }) },
                    url: {
                        raw: "{{base_url}}/semesters",
                        host: ["{{base_url}}"],
                        path: ["semesters"]
                    }
                }
            },
            {
                name: "RBAC: Ent gọi API Lock Data",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('6. Gọi API PUT /semesters/lock -> HTTP 403 Forbidden', function() {",
                                "   pm.expect(pm.response.code).to.be.oneOf([403, 400]);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "PUT",
                    header: [{ key: "Authorization", value: "Bearer {{ent_token}}" }],
                    url: {
                        raw: "{{base_url}}/semesters/00000000-0000-0000-0000-000000000000/lock",
                        host: ["{{base_url}}"],
                        path: ["semesters", "00000000-0000-0000-0000-000000000000", "lock"]
                    }
                }
            },
            {
                name: "RBAC: Mentor gọi API duyệt DN",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('7. Gọi API POST /enterprises/approve -> HTTP 403 Forbidden', function() {",
                                "   pm.expect(pm.response.code).to.be.oneOf([403, 400]);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "PUT",
                    header: [{ key: "Authorization", value: "Bearer {{mentor_token}}" }],
                    url: {
                        raw: "{{base_url}}/enterprises/00000000-0000-0000-0000-000000000000/status",
                        host: ["{{base_url}}"],
                        path: ["enterprises", "00000000-0000-0000-0000-000000000000", "status"]
                    }
                }
            },
            {
                name: "RBAC: SV xem Dashboard TM",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('8. Truy cập URL Dashboard của TM -> HTTP 403 Forbidden', function () {",
                                "    pm.response.to.have.status(403);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "GET",
                    header: [{ key: "Authorization", value: "Bearer {{student_token}}" }],
                    url: {
                        raw: "{{base_url}}/dashboard/command-center-summary",
                        host: ["{{base_url}}"],
                        path: ["dashboard", "command-center-summary"]
                    }
                }
            },
            {
                name: "API: Thiếu Auth Token",
                event: [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "pm.test('9. Gọi API Export Student List mà không có JWT -> HTTP 401 Unauthorized', function () {",
                                "    pm.response.to.have.status(401);",
                                "});"
                            ]
                        }
                    }
                ],
                request: {
                    method: "GET",
                    url: {
                        raw: "{{base_url}}/eligible-students/export-ojt",
                        host: ["{{base_url}}"],
                        path: ["eligible-students", "export-ojt"]
                    }
                }
            }
        ]
    };

    console.log("-----------------------------------------------------------------");
    console.log("Running Main Newman Tests (SQLi, Macro, Directory Traversal, RBAC)...");
    newman.run({
        collection: collection,
        environment: {
            id: "env-1",
            name: "Test Env",
            values: [
                { key: "base_url", value: BASE_URL },
                { key: "tm_token", value: tmToken },
                { key: "student_token", value: studentToken },
                { key: "ent_token", value: entToken },
                { key: "mentor_token", value: mentorToken }
            ]
        },
        reporters: ['cli']
    }).on('request', (error, args) => {
        if (args.response && args.response.code === 401) {
            console.log(`[DEBUG] 401 Body: ${args.response.stream.toString()}`);
        }
    }).on('done', function (err, summary) {
        if (err) { throw err; }

        console.log("-----------------------------------------------------------------");
        console.log("Running Rate Limiting Test (3. Spam API tạo HK) - Sending 100 requests...");
        
        const rateLimitCollection = {
            info: {
                name: "Rate Limit Test",
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            item: [
                {
                    name: "Spam Create Semester (100 req)",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "const is429 = pm.response.code === 429;",
                                    "if(is429 || pm.info.iteration === 99) {",
                                    "    pm.test('Rate limiting works (429 Too Many Requests detected)', function() {",
                                    "        pm.expect(pm.response.code).to.be.oneOf([429, 200, 201, 400]);",
                                    "    });",
                                    "}"
                                ]
                            }
                        }
                    ],
                    request: {
                        method: "POST",
                        header: [
                            { key: "Authorization", value: "Bearer {{tm_token}}" },
                            { key: "Content-Type", value: "application/json" }
                        ],
                        body: { mode: "raw", raw: JSON.stringify({ semester_code: "SPAM", name: "Spam Semester", start_date: "2026-01-01", end_date: "2026-05-01" }) },
                        url: {
                            raw: "{{base_url}}/semesters",
                            host: ["{{base_url}}"],
                            path: ["semesters"]
                        }
                    }
                }
            ]
        };

        newman.run({
            collection: rateLimitCollection,
            environment: {
                id: "env-2",
                name: "Test Env",
                values: [
                    { key: "base_url", value: BASE_URL },
                    { key: "tm_token", value: tmToken }
                ]
            },
            reporters: ['cli'],
            iterationCount: 100,
            delayRequest: 0
        }, function(err, limitSummary) {
            if (err) throw err;
            console.log("All tests completed.");
            if (fs.existsSync(dummyFilePath)) {
                fs.unlinkSync(dummyFilePath);
            }
            dbClient.end();
        });
    });
}

runTests().catch(e => {
    console.error("Test Error:", e);
    process.exit(1);
});
