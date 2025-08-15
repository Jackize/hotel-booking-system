import * as fs from 'fs';
import * as path from 'path';

export const AuthLoginSchema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'auth.login.avsc'), 'utf-8')
);

export const AuthLogoutSchema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'auth.logout.avsc'), 'utf-8')
);

export const AuthTokenRefreshSchema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'auth.token.refresh.avsc'), 'utf-8')
);