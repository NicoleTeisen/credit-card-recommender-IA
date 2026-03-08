importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0/dist/tf.min.js');

const workerEvents = {
  trainingStarted: 'training:started',
  trainingError: 'training:error',
  trainingComplete: 'training:complete',
  trainModel: 'train:model',
  recommend: 'recommend',
  trainingLog: 'training:log',
  progressUpdate: 'progress:update',
};

console.log('[Worker] Loaded successfully. TensorFlow.js version:', typeof tf !== 'undefined' ? tf.version.tfjs : 'NOT LOADED');

const WEIGHTS = {
  rewardPreference: 0.3,
  travelProfile: 0.05,
  income: 0.2,
  monthlySpend: 0.25,
  annualFee: 0.1,
  category: 0.05,
  benefit: 0.05,
}

let _model = null;
let _context = null;

const normalize = (value, min, max) => (Number(value) - min) / ((max - min) || 1);

const oneHot = (index, size, weight = 1) => {
  const arr = new Array(size).fill(0);
  if (index >= 0) arr[index] = 1 * weight;
  return arr;
};

const mapTravel = { nunca: 0, as_vezes: 0.5, muito: 1 };
const mapFeeTolerance = { baixa: 0, media: 0.5, alta: 1 };

function getCardVectorSize(ctx) {
  return 3 + ctx.categorySize + ctx.benefitSize + ctx.bestForSize;
}

function buildContext(users, cards) {
  const categories = [...new Set(cards.map((c) => c.category))];
  const benefits = [...new Set(cards.map((c) => c.benefitType))];
  const bestFor = [...new Set(cards.map((c) => c.bestFor))];
  const rewardPreferences = [...new Set(users.map((u) => u.rewardPreference))];
  const spendCategories = [...new Set(users.map((u) => u.mainSpendCategory))];

  return {
    users,
    cards,
    cardById: new Map(cards.map((c) => [c.id, c])),
    categoryIndex: Object.fromEntries(categories.map((v, i) => [v, i])),
    benefitIndex: Object.fromEntries(benefits.map((v, i) => [v, i])),
    bestForIndex: Object.fromEntries(bestFor.map((v, i) => [v, i])),
    rewardIndex: Object.fromEntries(rewardPreferences.map((v, i) => [v, i])),
    spendIndex: Object.fromEntries(spendCategories.map((v, i) => [v, i])),
    categorySize: categories.length,
    benefitSize: benefits.length,
    bestForSize: bestFor.length,
    rewardSize: rewardPreferences.length,
    spendSize: spendCategories.length,
    minFee: Math.min(...cards.map((c) => c.annualFee)),
    maxFee: Math.max(...cards.map((c) => c.annualFee)),
    minIncome: Math.min(...cards.map((c) => c.incomeRequired), ...users.map((u) => u.income)),
    maxIncome: Math.max(...cards.map((c) => c.incomeRequired), ...users.map((u) => u.income)),
    minSpend: Math.min(...users.map((u) => u.monthlySpend)),
    maxSpend: Math.max(...users.map((u) => u.monthlySpend)),
  };
}

function encodeCard(card, ctx) {
  const fee = normalize(card.annualFee, ctx.minFee, ctx.maxFee) * WEIGHTS.annualFee;
  const incomeRequired = normalize(card.incomeRequired, ctx.minIncome, ctx.maxIncome) * WEIGHTS.income;
  const travel = (card.travelBenefits ? 1 : 0) * WEIGHTS.travelProfile;

  return [
    fee,
    incomeRequired,
    travel,
    ...oneHot(ctx.categoryIndex[card.category], ctx.categorySize, WEIGHTS.category),
    ...oneHot(ctx.benefitIndex[card.benefitType], ctx.benefitSize, WEIGHTS.benefit),
    ...oneHot(ctx.bestForIndex[card.bestFor], ctx.bestForSize, 0.1),
  ];
}

function encodeUser(user, ctx) {
  const income = normalize(user.income, ctx.minIncome, ctx.maxIncome) * WEIGHTS.income;
  const monthlySpend = normalize(user.monthlySpend, ctx.minSpend, ctx.maxSpend) * WEIGHTS.monthlySpend;
  const travelProfile = (mapTravel[user.travelProfile] ?? 0) * WEIGHTS.travelProfile;
  const annualFeeTolerance = (mapFeeTolerance[user.annualFeeTolerance] ?? 0) * WEIGHTS.annualFee;

  const profileVec = [
    income,
    monthlySpend,
    travelProfile,
    annualFeeTolerance,
    ...oneHot(ctx.rewardIndex[user.rewardPreference], ctx.rewardSize, WEIGHTS.rewardPreference),
    ...oneHot(ctx.spendIndex[user.mainSpendCategory], ctx.spendSize, 0.1),
  ];

  const emptyOwnedCardsVec = new Array(getCardVectorSize(ctx)).fill(0);

  if (!user.cards?.length) return [...profileVec, ...emptyOwnedCardsVec];

  const ownedVectors = user.cards
    .map((c) => ctx.cardById.get(c.id))
    .filter(Boolean)
    .map((card) => encodeCard(card, ctx));

  if (!ownedVectors.length) return [...profileVec, ...emptyOwnedCardsVec];

  const meanOwned = ownedVectors[0].map((_, i) => {
    const sum = ownedVectors.reduce((acc, vec) => acc + vec[i], 0);
    return sum / ownedVectors.length;
  });

  return [...profileVec, ...meanOwned];
}

function createTrainingData(ctx) {
  const inputs = [];
  const labels = [];

  const users = ctx.users.filter((u) => Array.isArray(u.cards) && u.cards.length);
  users.forEach((user) => {
    const userVector = encodeUser(user, ctx);

    ctx.cards.forEach((card) => {
      const cardVector = encodeCard(card, ctx);
      const hasCard = user.cards.some((c) => c.id === card.id || c.name === card.name);
      inputs.push([...userVector, ...cardVector]);
      labels.push(hasCard ? 1 : 0);
    });
  });

  return {
    xs: tf.tensor2d(inputs),
    ys: tf.tensor2d(labels, [labels.length, 1]),
    inputDimensions: inputs[0]?.length ?? 0,
  };
}

async function configureNeuralNetAndTrain(trainData) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [trainData.inputDimensions], units: 128, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  model.compile({
    optimizer: tf.train.adam(0.008),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  const epochs = 70;
  await model.fit(trainData.xs, trainData.ys, {
    epochs,
    batchSize: 32,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        postMessage({
          type: workerEvents.trainingLog,
          epoch,
          loss: logs.loss,
          accuracy: logs.acc ?? logs.accuracy ?? 0,
        });

        postMessage({
          type: workerEvents.progressUpdate,
          percent: ((epoch + 1) / epochs) * 100,
        });
      },
    },
  });

  return model;
}

function recommend({ user }) {
  if (!_model || !_context || !user) return;

  const userVector = encodeUser(user, _context);
  const inputs = _context.cards.map((card) => [...userVector, ...encodeCard(card, _context)]);
  const inputTensor = tf.tensor2d(inputs);
  const predictions = _model.predict(inputTensor);
  const scores = Array.from(predictions.dataSync());

  inputTensor.dispose();
  predictions.dispose();

  const ownedIds = new Set((user.cards || []).map((c) => c.id));
  const recommendations = _context.cards
    .filter((card) => !ownedIds.has(card.id))
    .map((card) => {
      const reasons = [];
      
      // Explain based on reward preference match
      if (card.benefitType === user.rewardPreference) {
        reasons.push(`Benefício ${card.benefitType} combina com sua preferência`);
      }
      
      // Explain based on travel profile
      if (card.travelBenefits && (user.travelProfile === 'muito' || user.travelProfile === 'as_vezes')) {
        reasons.push('Oferece benefícios de viagem que você aproveita');
      }
      
      // Explain based on annual fee tolerance
      if (card.annualFee === 0 && user.annualFeeTolerance === 'baixa') {
        reasons.push('Sem anuidade - ideal para seu perfil');
      } else if (card.annualFee > 500 && user.annualFeeTolerance === 'alta') {
        reasons.push('Taxa anual premium com benefícios exclusivos');
      }
      
      // Explain based on spending category
      if (card.bestFor === user.mainSpendCategory) {
        reasons.push(`Otimizado para gastos em ${user.mainSpendCategory}`);
      }
      
      // Income compatibility
      const incomeCompatible = user.income >= card.incomeRequired;
      if (!incomeCompatible) {
        reasons.push('⚠️ Renda mínima pode ser um desafio');
      }
      
      return {
        ...card,
        score: scores[_context.cards.findIndex((c) => c.id === card.id)] ?? 0,
        reasons: reasons.length > 0 ? reasons : ['Compatibilidade geral com seu perfil'],
        incomeCompatible,
      };
    })
    .sort((a, b) => b.score - a.score);

  postMessage({
    type: workerEvents.recommend,
    user,
    recommendations,
  });
}

async function trainModel({ users, cards }) {
  if (!users?.length || !cards?.length) return;

  try {
    postMessage({ type: workerEvents.trainingStarted, message: 'Inicializando IA...' });

    if (_model) {
      _model.dispose();
      _model = null;
    }

    _context = buildContext(users, cards);
    const trainData = createTrainingData(_context);
    _model = await configureNeuralNetAndTrain(trainData);
    trainData.xs.dispose();
    trainData.ys.dispose();

    postMessage({ type: workerEvents.trainingComplete });
  } catch (error) {
    console.error('[Worker] Training error:', error);
    postMessage({
      type: workerEvents.trainingError,
      message: `${error?.message || 'Erro inesperado'} | Stack: ${error?.stack?.substring(0, 100) || 'N/A'}`,
    });
  }
}

self.addEventListener('message', async (event) => {
  try {
    const data = event.data;
    console.log('[Worker] Received message:', data.type);

    if (data.type === workerEvents.trainModel) {
      await trainModel({ users: data.users, cards: data.cards });
    }

    if (data.type === workerEvents.recommend) {
      recommend({ user: data.user });
    }
  } catch (error) {
    console.error('[Worker] Message handler error:', error);
    postMessage({
      type: workerEvents.trainingError,
      message: `Worker event error: ${error?.message}`,
    });
  }
});

self.addEventListener('error', (event) => {
  console.error('[Worker] Global error:', event);
  postMessage({
    type: workerEvents.trainingError,
    message: `Worker global error: ${event.message}`,
  });
});
