import { AuthLoginSchema, AuthLogoutSchema, AuthTokenRefreshSchema } from '@hotel/contracts/avro/auth';
import * as avro from 'avsc';
import KafkaWrapper from 'ts-common/dist/kafka';
export class AuthEvents {
    private kafka: KafkaWrapper;
    constructor(brokers: string[]) {
        this.kafka = new KafkaWrapper(brokers);
    }

    private loginType = avro.Type.forSchema(AuthLoginSchema);
    private logoutType = avro.Type.forSchema(AuthLogoutSchema);
    private tokenRefreshType = avro.Type.forSchema(AuthTokenRefreshSchema);

    async connect() { await this.kafka.connect(); }
    async disconnect() { await this.kafka.disconnect(); }
    async onModuleInit() { await this.kafka.connect(); }
    async onModuleDestroy() { await this.kafka.disconnect(); }

    async publishLogin(evt: any) {
        const value = this.loginType.toBuffer(evt);
        await this.kafka.sendMessage('auth.login', [{ value }]);
    }

    async publishLogout(evt: any) {
        const value = this.logoutType.toBuffer(evt);
        await this.kafka.sendMessage('auth.logout', [{ value }]);
    }

    async publishTokenRefresh(evt: any) {
        const value = this.tokenRefreshType.toBuffer(evt);
        await this.kafka.sendMessage('auth.token.refresh', [{ value }]);
    }
}