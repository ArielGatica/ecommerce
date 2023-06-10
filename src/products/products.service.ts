import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Products, ProductImages } from './entities';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,

    @InjectRepository(ProductImages)
    private readonly productImageRepository: Repository<ProductImages>,

    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images= [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user
      });

      await this.productRepository.save(product);
      return { ...product, images: images }
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findAllPagination(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
  }

  async findOne(param: string) {
    let product: Products;

    if(isUUID(param))
      product = await this.productRepository.findOneBy({ id: param });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder.where('UPPER(title)= :title or slug= :slug', {
        title: param.toUpperCase(),
        slug: param.toLowerCase()
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne(); 
    }

    if (!product)
      throw new NotFoundException(`Product not found with params: '${param}'`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...restToUpdate } = updateProductDto;
    const product = await this.productRepository.preload({ id, ...restToUpdate })
    
    if(!product) 
      throw new NotFoundException(`Product not found with id: '${id}'`)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    
    try {
      if(images){
        await queryRunner.manager.delete(ProductImages, { product: { id } })

        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        )
      }

      product.user = user
      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()
      return this.findOne(id)

    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async deleteAllProducts() {
    const queryDelete = this.productRepository.createQueryBuilder('product')
    
    try {
      return await queryDelete.delete().where({}).execute()
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      `Chek server logs console - ${error}`,
    );
  }
}
