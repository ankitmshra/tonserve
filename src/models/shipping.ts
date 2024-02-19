import { BaseEntity, generateEntityId } from "@medusajs/medusa"
import { 
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { Fulfillment } from "@medusajs/medusa";

@Entity()
export class Shipping extends BaseEntity {
  @Column({ type: "varchar" })
  label: string

  @Column({ type: "varchar", nullable: true })
  trackingurl: string

  @Column({ type: "varchar" })
  fulfillment: string
  
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "ship")
  }
}