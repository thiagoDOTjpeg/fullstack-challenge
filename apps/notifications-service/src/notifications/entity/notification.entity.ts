import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}