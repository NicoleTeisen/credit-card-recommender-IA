# 🎯 Recomendador de Cartões de Crédito com IA

Sistema de recomendação inteligente usando TensorFlow.js, arquitetura MVC e Web Workers.

## 🚀 Funcionalidades Implementadas

### ✅ Core Features
- **Machine Learning com TensorFlow.js** - Rede neural treinada em tempo real
- **Arquitetura MVC** - Separação clara de responsabilidades
- **Web Workers** - Treinamento assíncrono sem travar a UI
- **Sistema de Eventos** - Event-driven architecture com CustomEvents

### ✨ Melhorias Implementadas

#### 1. **Explicabilidade (Explainability)**
- Cada recomendação mostra **por que** foi sugerida
- Fatores considerados:
  - Match de preferência de benefício (cashback, pontos, milhas)
  - Compatibilidade com perfil de viagem
  - Adequação à tolerância de anuidade
  - Otimização para categoria de gasto principal
  - Validação de renda mínima

#### 2. **Filtros Inteligentes**
- Filtro por categoria (básico, intermediário, premium)
- Filtro por tipo de benefício (cashback, pontos, milhas)
- Filtragem em tempo real sem retreinar modelo

#### 3. **Badges Visuais**
- 🏆 **Melhor escolha** - Score > 70% e primeira posição
- ⚠️ **Renda mínima** - Alerta quando renda é insuficiente
- 🎯 **Score de compatibilidade** - Porcentagem de match

#### 4. **Feedback Visual Aprimorado**
- Toast notifications ao adicionar cartão
- Barra de progresso animada durante treinamento
- Métricas de qualidade do modelo (Excelente/Boa/Regular)
- Cards desabilitados quando renda incompatível

#### 5. **Estatísticas do Modelo**
- Acurácia do treinamento
- Loss por época
- Qualidade final do modelo

## 📦 Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Acessar em http://localhost:3000
```

## 🏗️ Estrutura do Projeto

```
credit-card-recommender/
├── index.html              # Interface principal
├── style.css               # Estilos customizados
├── package.json            # Dependências
├── data/
│   ├── cards.json         # 30 cartões diferentes
│   └── users.json         # 20 perfis de usuários
└── src/
    ├── index.js           # Bootstrap da aplicação
    ├── controller/        # Lógica de controle
    ├── service/           # Camada de dados
    ├── view/              # Interface e templates
    ├── events/            # Sistema de eventos
    └── workers/           # Web Worker com TensorFlow.js
```

## 🎓 Conceitos Aprendidos

### Machine Learning
- Feature Engineering (normalização, one-hot encoding)
- Rede neural sequencial (128→64→32→1)
- Binary classification com sigmoid
- Adam optimizer
- Training callbacks

### Arquitetura
- MVC pattern em JavaScript vanilla
- Event-driven architecture
- Separation of concerns
- Web Workers para computação pesada

### UX/UI
- Progressive disclosure
- Explainable AI
- Real-time filtering
- Visual feedback
- Toast notifications

## 🔮 Próximas Melhorias Possíveis

### Curto Prazo
1. **Comparador de cartões** - Comparar 2-3 side-by-side
2. **Busca por nome** - Buscar cartão específico
3. **Histórico de solicitações** - Ver cartões solicitados
4. **Export de recomendações** - Baixar relatório PDF

### Médio Prazo
5. **Score de aprovação** - Prever probabilidade de aprovação
6. **Simulador de gastos** - Calcular benefícios estimados
7. **A/B Testing** - Testar diferentes configurações do modelo
8. **Persistência** - Salvar estado no localStorage

### Longo Prazo
9. **Backend real** - API REST para dados
10. **Autenticação** - Login de usuários
11. **Collaborative filtering** - Usar dados de outros usuários
12. **Deep Learning avançado** - Transformer models

## 📊 Métricas de Qualidade

- **Acurácia**: ~75-85% após 70 épocas
- **Performance**: Treinamento em ~3-5 segundos
- **UX**: Feedback visual em < 100ms
- **Code Quality**: ESM modules, sem warnings

## 🛠️ Stack Tecnológica

- **ML**: TensorFlow.js 4.2.0
- **UI**: Bootstrap 5.3.3 + Bootstrap Icons
- **Dev Server**: Browser-sync 3.0.4
- **JavaScript**: ES6+ modules
- **CSS**: Custom properties + Bootstrap

