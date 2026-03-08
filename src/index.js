import { CardController } from './controller/CardController.js';
import { ModelTrainingController } from './controller/ModelTrainingController.js';
import { UserController } from './controller/UserController.js';
import { WorkerController } from './controller/WorkerController.js';
import { Events } from './events/events.js';
import { CardService } from './service/CardService.js';
import { UserService } from './service/UserService.js';
import { CardView } from './view/CardView.js';
import { ModelTrainingView } from './view/ModelTrainingView.js';
import { UserView } from './view/UserView.js';

async function bootstrap() {
  const events = new Events();

  const cardService = new CardService();
  const userService = new UserService();

  const cardView = new CardView();
  const userView = new UserView();
  const modelTrainingView = new ModelTrainingView();

  await Promise.all([
    cardView.init(),
    userView.init(),
    userService.getDefaultUsers(),
  ]);

  new WorkerController({ events });
  new UserController({ userView, userService, events });
  new CardController({ cardView, events, cardService });
  new ModelTrainingController({ events, userService, cardService, modelTrainingView });
}

bootstrap();