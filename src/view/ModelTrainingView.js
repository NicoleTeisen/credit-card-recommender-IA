export class ModelTrainingView {
  #status = document.querySelector('#trainingStatus');
  #progressBar = document.querySelector('#trainingProgressBar');
  #metrics = document.querySelector('#trainingMetrics');
  #lastAccuracy = 0;

  setTrainingStarted(message = 'Treinando modelo...') {
    this.#status.className = 'badge text-bg-warning';
    this.#status.textContent = message;
    this.#progressBar.classList.add('progress-bar-striped', 'progress-bar-animated');
    this.updateProgress({ percent: 0 });
  }

  updateProgress({ percent }) {
    const value = Math.max(0, Math.min(100, Math.round(percent || 0)));
    this.#progressBar.style.width = `${value}%`;
    this.#progressBar.textContent = `${value}%`;
  }

  updateMetrics({ epoch, loss, accuracy }) {
    this.#lastAccuracy = accuracy;
    const accPercent = (Number(accuracy) * 100).toFixed(1);
    this.#metrics.innerHTML = `
      Época ${epoch + 1} · 
      Loss <strong>${Number(loss).toFixed(4)}</strong> · 
      Acurácia <strong>${accPercent}%</strong>
    `;
  }

  setTrainingComplete() {
    this.#status.className = 'badge text-bg-success';
    const quality = this.#lastAccuracy > 0.8 ? 'Excelente' : this.#lastAccuracy > 0.6 ? 'Boa' : 'Regular';
    this.#status.textContent = `Modelo pronto · Qualidade: ${quality}`;
    this.#progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
    this.updateProgress({ percent: 100 });
  }

  setTrainingError(message = 'Falha no treinamento') {
    this.#status.className = 'badge text-bg-danger';
    this.#status.textContent = 'Erro no treinamento';
    this.#metrics.textContent = message;
    this.#progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
  }
}
