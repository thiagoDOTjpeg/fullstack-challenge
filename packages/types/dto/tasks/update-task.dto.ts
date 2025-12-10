import { PartialType } from "@nestjs/swagger";
import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto extends PartialType(CreateTaskDto) { }

export interface UpdateTaskPayload extends UpdateTaskDto {
  task_id: string;
  author_id: string
}
