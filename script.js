// Caminho para a pasta do modelo exportado do Teachable Machine
// Ajuste o caminho conforme sua pasta (ex: "./my_model/")
const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// Função chamada ao clicar no botão "Start"
async function init() {
  // 1. Carrega o modelo
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // 2. Configura a Webcam
  const flip = true; // inverte a imagem da webcam
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup(); // solicita acesso à webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // 3. Adiciona a webcam ao DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);

  // 4. Container para resultado da Webcam
  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = ""; // limpa o container

  // 5. Exibe o container da webcam e oculta o container de upload
  labelContainer.style.display = "block";
  document.getElementById("image-label-container").style.display = "none";

  // 6. Configura o upload de imagem
  setupImageUpload();
}

// Loop que roda continuamente para classificar a imagem da webcam
async function loop() {
  webcam.update(); // atualiza o frame da webcam
  await predictWebcam();
  window.requestAnimationFrame(loop);
}

// Classifica o que a webcam está vendo
async function predictWebcam() {
  if (!model) return;
  // Pede a predição
  const prediction = await model.predict(webcam.canvas);

  // Ordena pela maior probabilidade
  prediction.sort((a, b) => b.probability - a.probability);

  // Pega apenas a melhor predição
  const best = prediction[0];

  // Exibe só a melhor predição
  labelContainer.innerHTML = `${best.className}: ${(best.probability * 100).toFixed(2)}%`;
}

// Configura o upload de imagem e a classificação quando a imagem carrega
function setupImageUpload() {
  const imageInput = document.getElementById("imageInput");
  const preview = document.getElementById("preview");
  const imageLabelContainer = document.getElementById("image-label-container");

  // Ao escolher um arquivo...
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      // Mostra a imagem no <img id="preview">
      preview.src = event.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // Quando a imagem no <img> terminar de carregar, classifica
  preview.onload = async function () {
    if (!model) {
      alert("O modelo ainda não foi carregado. Tente novamente.");
      return;
    }

    // Faz a predição usando o preview como entrada
    const predictions = await model.predict(preview);

    // Ordena pela maior probabilidade
    predictions.sort((a, b) => b.probability - a.probability);

    // Pega a melhor predição
    const best = predictions[0];

    // Exibe somente a melhor predição
    imageLabelContainer.innerHTML = `${best.className} - ${(best.probability * 100).toFixed(2)}%`;

    // Oculta o resultado da webcam e mostra o do upload
    labelContainer.style.display = "none";
    imageLabelContainer.style.display = "block";
  };
}
