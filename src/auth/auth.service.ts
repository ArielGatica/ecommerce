import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { hashSync, compareSync } from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...useData } = createUserDto;
      const user = this.userRepository.create({
        ...useData,
        password: hashSync(password, 10),
      });

      await this.userRepository.save(user);
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true }
    })

    if(!user) 
      throw new UnauthorizedException(`Credentials are not valid (email)`)

    if(!compareSync(password, user.password)) 
      throw new UnauthorizedException(`Credentials are not valid (password)`)
  
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload)
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private handleExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException(
      `Please chek server logs - ${error}`,
    );
  }
}
