# yolov5 を用いた Object detection のサンプルコード

## データの流れ

1. HTMLImageElement (img タグ　<img />) をレンダリングする　.
2. レンダリングした画像がロードされたら (`<img >`タグの`onLoad`), HTMLImageElement オブジェクトを取得して以下の内容を関数で実行する.
3. HTMLImageElement を `tf.browser.fromPixels`で Tensor に変換.
4. model を読み込む. `/public/web_model/model.json` からモデルを取得して読み込む.
5. Tensor をモデルに渡して, 推論結果 (Tensor)を得る.
6. 推論結果を JavaScript Array に整形する.
7. 画像上に推論結果を描画する.
