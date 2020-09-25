import { Controller, Post, UseGuards, UsePipes, ValidationPipe, Body, Patch, Query, Get } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../decorators/get-user.decorator';
import { CreateContactDetailDto, UpdateContactDetailDto } from '../dto/user.dto';

@Controller('user')
export class UserController {
    constructor(private authService: AuthService) {}

    @Post('/contact-detail')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe({ transform: true }))
    createContactDetail(
        @GetUser() user: any,
        @Body() contactDetail: CreateContactDetailDto
    ) {
        return this.authService.createContactDetail(contactDetail, user.userId);
    }
    
    @Patch('/contact-detail')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe({ transform: true }))
    updateContactDetail(
        @GetUser() user: any,
        @Body() contactDetail: UpdateContactDetailDto
    ) {
        return this.authService.updateContactDetail(contactDetail, user.userId);
    }

    @Get('/contact-detail')
    getContactDetailByUserId(
        @Query('id') userId: string
    ) {
        return this.authService.getContactDetailByUserId(userId);
    }
}
