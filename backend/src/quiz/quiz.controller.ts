import { Body, Controller, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateIntakeDto } from './dto/create-intake.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('intake')
  create(@Body() dto: CreateIntakeDto) {
    return this.quizService.createIntake(dto);
  }
}
