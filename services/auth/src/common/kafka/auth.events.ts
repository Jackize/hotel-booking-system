import { AuthLoginSchema, AuthLogoutSchema, AuthTokenRefreshSchema } from '@hotel/contracts/avro/auth';
import { TOKENS, KafkaWrapper } from '@hotel/ts-common';
import { Inject } from '@nestjs/common';
import * as avro from 'avsc';

export class AuthEvents {

    constructor(@Inject(TOKENS.KAFKA_PRODUCER) private readonly kafka: KafkaWrapper) {
    }

    private loginType = avro.Type.forSchema(AuthLoginSchema);
    private logoutType = avro.Type.forSchema(AuthLogoutSchema);
    private tokenRefreshType = avro.Type.forSchema(AuthTokenRefreshSchema);

    async onModuleInit() {
        await this.kafka.connectProducer();
        await this.kafka.ensureTopic('auth.login', 3, 1)
        await this.kafka.ensureTopic('auth.logout', 3, 1)
        await this.kafka.ensureTopic('auth.token.refresh', 3, 1)
    }
    async onModuleDestroy() { await this.kafka.disconnect(); }

    async publishLogin(evt: any) {
        const value = this.loginType.toBuffer(evt);
        await this.kafka.send('auth.login', [{ value }]);
    }

    async publishLogout(evt: any) {
        const value = this.logoutType.toBuffer(evt);
        await this.kafka.send('auth.logout', [{ value }]);
    }

    async publishTokenRefresh(evt: any) {
        const value = this.tokenRefreshType.toBuffer(evt);
        await this.kafka.send('auth.token.refresh', [{ value }]);
    }
}