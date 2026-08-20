import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Apply with @UseGuards(JwtAuthGuard) on any controller/route that requires
 * a logged-in user. Populates request.user via JwtStrategy.validate().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
