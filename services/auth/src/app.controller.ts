import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppAuthService } from './app.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SignupDto } from './dto/signup.dto';
import { AccessJwtGuard } from './guard/access.guard';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AppController {
  constructor(private readonly appAuthService: AppAuthService) { }

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    console.log("🚀 ~ AppController ~ signup ~ dto:", dto)
    return this.appAuthService.signup(dto.email, dto.fullName, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.appAuthService.login(dto.email, dto.password, req.ip, req.headers['user-agent']);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.appAuthService.refresh(dto.refreshToken);
  }

  @UseGuards(AccessJwtGuard)
  @Post('logout')
  logout(@Req() req: any, @Body('refreshToken') rt?: string) {
    const userId = req.user?.sub ?? req.body.userId; // tuỳ bạn gắn guard
    return this.appAuthService.logout(userId, rt, req.ip ?? null);
  }
}
