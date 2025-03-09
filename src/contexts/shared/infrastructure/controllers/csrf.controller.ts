import { Controller, Get } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('CSRF')
@Controller('csrf')
export class CsrfController {
  @Get()
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiNoContentResponse({
    description: 'CSRF token is returned in the x-csrf-token header',
  })
  getCsrfToken(): void {
    // The CSRF middleware will handle token generation and response headers
    return;
  }
}
