import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseEntity } from '../entities/auth-response.entity';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiCreatedResponse({ type: AuthResponseEntity })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { data: new AuthResponseEntity(result) };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Realiza login' })
  @ApiOkResponse({ type: AuthResponseEntity })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return { data: new AuthResponseEntity(result) };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o perfil autenticado' })
  @ApiOkResponse({ type: AuthUserEntity })
  async me(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.authService.getProfile(user.id);
    return { data: new AuthUserEntity(profile) };
  }
}
