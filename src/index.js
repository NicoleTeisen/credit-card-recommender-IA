import { CardController } from './controller/CardController.js';
import { ModelTrainingController } from './controller/ModelTrainingController.js';
import { UserController } from './controller/UserController.js';
import { WorkerController } from './controller/WorkerController.js';
import { VectorDBController } from './controller/VectorDBController.js';
import { Events } from './events/events.js';
import { CardService } from './service/CardService.js';
import { UserService } from './service/UserService.js';
import { CardView } from './view/CardView.js';
import { ModelTrainingView } from './view/ModelTrainingView.js';
import { UserView } from './view/UserView.js';

async function bootstrap() {
  try {
    console.log('[Bootstrap] Starting application...');
    
    const events = new Events();

    const cardService = new CardService();
    const userService = new UserService();

    const cardView = new CardView();
    const userView = new UserView();
    const modelTrainingView = new ModelTrainingView();

    // Initialize VectorDB asynchronously
    console.log('[Bootstrap] Initializing VectorDB in background...');
    const vectorDBController = new VectorDBController({ events });
    vectorDBController.initialize().catch(err => {
      console.warn('[Bootstrap] VectorDB initialization failed (will retry on first use):', err.message);
    });

    await Promise.all([
      cardView.init(),
      userView.init(),
      userService.getDefaultUsers(),
    ]);

    console.log('[Bootstrap] Creating controllers...');
    new WorkerController({ events });
    new UserController({ userView, userService, events });
    new CardController({ cardView, events, cardService });
    new ModelTrainingController({ events, userService, cardService, modelTrainingView });
    
    console.log('[Bootstrap] ✅ Application ready!');
  } catch (error) {
    console.error('[Bootstrap] ❌ Error during initialization:', error);
  }
}

bootstrap();