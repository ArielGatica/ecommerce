import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImages } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
@Entity({ name: 'products' })
export class Products {
  
  @ApiProperty({
    example: '4c0e1ca2-9663-4c4b-b755-d3bbf692b051',
    description: 'Product ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product title',
    uniqueItems: true
  })
  @Column({ type: 'text',  unique: true })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', { default: 0 })
  price: number

  @ApiProperty({
    example: 'Commodo aliqua consequat consequat voluptate veniam nostrud labore nisi',
    description: 'Product description',
    default: null
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product slug for SEO',
    uniqueItems: true
  })
  @Column({ type: 'text', unique: true })
  slug: string

  @ApiProperty({
    example: 10,
    description: 'Product stock',
   default: 0
  })
  @Column({ type: 'int', default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Product sizes'
  })
  @Column({ type: 'text', array: true })
  sizes: string[];

  @ApiProperty({
    example: 'woman',
    description: 'Product gender'
  })
  @Column({ type: 'text' })
  gender: string;

  @ApiProperty()
  @Column({ type: 'text', array: true, default: [] })
  tags: string[]

  @ApiProperty()
  @OneToMany(() => ProductImages, (productImage) => productImage.product, { cascade: true, eager: true })
  images?: ProductImages[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User
  
  @BeforeInsert()
  checkSlugInsert() {
    if(!this.slug) 
      this.slug = this.title

    this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll('-','_').replaceAll("'", '')
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll('-','_').replaceAll("'", '')
  }
}
