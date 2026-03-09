export const events = {
  userSelected: 'user:selected',
  usersUpdated: 'users:updated',
  cardAdded: 'card:added',
  cardRemoved: 'card:removed',
  modelTrain: 'training:train',
  trainingComplete: 'training:complete',
  modelProgressUpdate: 'model:progress-update',
  recommendationsReady: 'recommendations:ready',
  recommend: 'recommend',
  embeddingsReady: 'embeddings:ready',
};

export const workerEvents = {
  trainingStarted: 'training:started',
  trainingError: 'training:error',
  trainingComplete: 'training:complete',
  trainModel: 'train:model',
  recommend: 'recommend',
  trainingLog: 'training:log',
  progressUpdate: 'progress:update',
  embeddingsExtracted: 'embeddings:extracted',
};
