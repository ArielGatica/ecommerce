import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImages } from "./product-image.entity";
@Entity({ name: 'products' })
export class Products {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text',  unique: true })
  title: string;

  @Column('float', { default: 0 })
  price: number

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', unique: true })
  slug: string

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'text', array: true })
  sizes: string[];

  @Column({ type: 'text' })
  gender: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[]

  @OneToMany(() => ProductImages, (productImage) => productImage.product, { cascade: true, eager: true })
  images?: ProductImages[];
  
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
