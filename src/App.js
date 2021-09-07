import "./styles.css";
import React from "react";
import * as tf from "@tensorflow/tfjs";

import Kinako from "./kinako2.jpg"; // Cat in Sugashima island
import { annotationNames } from "./model_classes";

const modelPath = "/web_model/model.json";
const widthForTensor = 320;
const heightForTensor = 320;

const LoadModel = async () => {
  await tf.ready();
  const model = await tf.loadGraphModel(modelPath);
  return model;
};

function ImgRefToImg(imgRef) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imgRef.current.src;
  img.width = widthForTensor;
  img.height = heightForTensor;
  return img;
}

function imgToTensor(img) {
  // const imgTensor = await tf.browser.fromPixelsAsync(img);
  const imgTensor = tf.browser.fromPixels(img);
  const inputTensor = tf.image
    .resizeBilinear(imgTensor, [widthForTensor, heightForTensor])
    .div(255.0)
    .expandDims(0);
  return inputTensor;
}

async function PerformDetect(imgTensor) {
  // 1. Load model
  const model = await LoadModel();
  // 2. Load image from by refering to image tag.
  // const img = ImgRefToImg(imgRef);

  // 3. Convert HTMLImageElement to tensor
  // const inputTensor = imgToTensor(img);

  // 4. Execute prediction
  const results = await model.executeAsync(imgTensor);
  return results;
}

async function formatOutPut(results) {
  const boxes = await results[0].dataSync();
  const scores = await results[1].dataSync();
  const classes = await results[2].dataSync();
  const valid_detections = await results[3].dataSync();

  const predictionsArray = [];
  for (let i = 0; i < valid_detections[0]; ++i) {
    let [x1, y1, x2, y2] = boxes.slice(i * 4, (i + 1) * 4);
    const xStart = x1 * widthForTensor;
    const xEnd = x2 * widthForTensor;
    const boxWidth = xEnd - xStart;

    const yStart = y1 * heightForTensor;
    const yEnd = y2 * heightForTensor;
    const boxHeight = yEnd - yStart;

    const score = scores[i].toFixed(2);

    // AIの判定した数字を人間が読んでわかる文字列に変換
    const classIndex = classes[i];
    const annotationName = annotationNames[classIndex];
    predictionsArray.push({
      xStart,
      xEnd,
      boxWidth,
      yStart,
      yEnd,
      boxHeight,
      annotationName,
      score
    });
  }
  return predictionsArray;
}

// Execute prediction
// 1. Load image from img tag
// 2. Convert image to tensor and resize.
// 3. Calculate prediction
// 4 Format prediction data
// 5. Draw bounding box and annotation

const wrapOnloadExecute = (ref) => {
  async function onLoadExecute(event) {
    const img = event.target;
    img.crossOrigin = "Anonymous";
    const imgTensor = imgToTensor(img);

    const predictions = await PerformDetect(imgTensor);
    const predictionsArray = await formatOutPut(predictions);

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    predictionsArray.forEach((prediction) => {
      drawDetection(prediction, ctx);
    });
  }
  return onLoadExecute;
};

// Draw the bounding box from a prediction to canvas
// ctx: CanvasRenderingContext2D
function drawDetection(prediction, ctx) {
  // Split prediction data
  const {
    xStart,
    yStart,
    boxWidth,
    boxHeight,
    annotationName,
    score
  } = prediction;

  ctx.beginPath();
  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 4;
  // Draw line
  ctx.rect(xStart, yStart, boxWidth, boxHeight);
  // Draw annotation string and score.
  ctx.fillText(`${annotationName}:${score}`, xStart, yStart - 5);
  ctx.stroke();
}

export default function App() {
  const imgRef = React.useRef(null);
  const boxRef = React.useRef(null);
  React.useEffect(() => {}, []);
  return (
    <>
      <h1>Hello Yolov5</h1>
      <p>Hi I am a cat</p>
      <img
        ref={imgRef}
        src={Kinako}
        onLoad={wrapOnloadExecute(boxRef)}
        alt="kinako"
      />
      <canvas ref={boxRef} width="320" height="320" />
    </>
  );
}
