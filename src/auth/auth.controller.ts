import 'dotenv/config';
import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, Query, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtPayload, Tokens } from './interfaces';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, CurrentUser, Public, Roles, UserAgent } from '@common/decorators';
import { UserResponse } from '@user/responses';
import { RolesGuard } from './guards/role.guard';
import { Role } from 'generated/prisma';
import { GoogleGuard } from './guards/google.guard';
import { HttpService } from '@nestjs/axios';
import { map, mergeMap, tap } from 'rxjs';
import { handleTimeoutAndErrors } from '@common/helpers';


const REFRESH_TOKEN = 'refreshtoken'

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

  ) { }


  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);

    if (!user) {
      throw new BadRequestException(`Не вдалось зареєструвати користувача з даними ${JSON.stringify(dto)}`)
    }
    return new UserResponse(user);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {
    const tokens = await this.authService.login(dto, agent);
    if (!tokens) {
      throw new BadRequestException(`Не вдається увійти з таким даними ${JSON.stringify(dto)}`);
    }
    this.setRefreshTokentoCookies(tokens, res);
  }

  @Get('logout')
  async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response,) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }
    await this.authService.deleteRefreshToken(refreshToken);
    res.cookie(REFRESH_TOKEN, '', { httpOnly: true, secure: true, expires: new Date() });
    res.sendStatus(HttpStatus.OK);
  }

  @Get('refresh-tokens')
  async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    if (!tokens) {
      throw new UnauthorizedException();
    }
    this.setRefreshTokentoCookies(tokens, res);
  }


  private setRefreshTokentoCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
  }

  @UseGuards(GoogleGuard)
  @Get('google')
  googleAuth() {

  }
  @UseGuards(GoogleGuard)
  @Get('google/callback')
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const token = req.user['accessToken']
    return res.redirect(`http://localhost:3000/api/auth/success?token=${token}`);
  }

  @Get('success')
  success(@Query('token') token: string, @UserAgent() agent: string, @Res() res: Response) {
    return this.httpService
      .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
      .pipe(
        mergeMap(({ data: { email } }) => this.authService.googleAuth(email, agent)),
        map((data) => this.setRefreshTokentoCookies(data, res)),
        handleTimeoutAndErrors()
      );
  }


}
