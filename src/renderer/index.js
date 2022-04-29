class Renderer {
    _width = 300;
    _height = 184;
    _renderer = null;
    _supportedEffects = [{
        name: 'spin',
        text: '旋转',
    }, {
        name: 'shutter',
        text: '百叶窗',
    }];
    _canvases = [];

    constructor() {
        this._prepareRenderer();
    }
    render(effect, dataSet) {
        this._canvases = [];
        switch(effect) {
            case 'spin':
                this._renderSpin(dataSet);
                break;
            case 'shutter':
                this._renderShutter(dataSet);
                break;
            default:
                this._renderDefault(dataSet);
                break;
        }
    }

    _renderSpin(dataSet) {}

    _renderShutter(dataSet) {}

    _renderDefault(dataSet) {
        const msg = document.getElementById("msg");
        msg.innerText = "开始渲染";
        this._renderAvatar(dataSet.avatar);
        this._renderWhoAmI();
        this._renderImage(dataSet.images);
        this._renderer.render();
        msg.innerText = "渲染成功";
    }

    getSupportedEffects() {
        return this._supportedEffects;
    }

    _prepareRenderer() {
        this._renderer = new GIF({
            workers: 8,
            quality: 10,
            workerScript: './assets/js/gif.worker.js'
        });

        this._renderer.on('finished', (blob) =>  {
            document.querySelector("#target").src = URL.createObjectURL(blob);
            this._prepareRenderer();
        });
    }

    _renderAvatar(avatar) {
        this._renderCanvas(avatar, 1000);
    }

    _renderWhoAmI() {
        var canvas = document.createElement("canvas");
        canvas.width = this._width;
        canvas.height = this._height;
        this._drawText(canvas, "我是谁");
        this._canvases.push(canvas);
        this._renderer.addFrame(canvas, { delay: 1000 });
    }

    _renderImage(images) {
        images.forEach((imageData) => {
            this._renderCanvas(imageData.image, imageData.latency);
        })
    }

    _renderCanvas(image, latency) {
        var canvas = document.createElement("canvas");
        canvas.width = this._width;
        canvas.height = this._height;
        this._drawImage(image, canvas);
        this._canvases.push(canvas);
        this._renderer.addFrame(canvas, { delay: latency });
    }

    _drawText(canvas, text) {
        const preview = document.getElementById("can");
        preview.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        let ctx = canvas.getContext("2d");
        let fontWeight = 900;
        let fontSize = 50;
        let font = 'Courier New'
        ctx.fillStyle = "white";
        ctx.font = `${fontWeight} ${fontSize}px ${font}`;
        ctx.textAlign="center";
        ctx.fillText(text, this._width / 2, (this._height + fontSize) / 2);
        ctx.strokeText(text, this._width / 2, (this._height + fontSize) / 2);

        ctx = preview.getContext("2d");
        ctx.fillStyle = "white";
        ctx.font = `${fontWeight} ${fontSize}px ${font}`;
        ctx.textAlign="center";
        ctx.fillText(text, this._width / 2, (this._height + fontSize) / 2);
        ctx.strokeText(text, this._width / 2, (this._height + fontSize) / 2);
    }

    _drawImage(image, canvas) {
        const preview = document.getElementById("can");
        preview.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        let startX = 0;
        let startY = 0;
        let endX = canvas.width;
        let endY = canvas.height;
        if (image.width / canvas.width <= image.height / canvas.height) {
            startX = canvas.width / 2 - (image.width * canvas.height) / (2 * image.height);
            endX = image.width * canvas.height / image.height;
        } else {
            startY = canvas.height / 2 - (image.height * canvas.width) / (2 * image.width);
            endY = image.height * canvas.width / image.width;
        }

        canvas.getContext("2d").drawImage(image, 0, 0, image.width, image.height, startX, startY, endX, endY);
        preview.getContext("2d").drawImage(image, 0, 0, image.width, image.height, startX, startY, endX, endY);
    }
}

module.exports = Renderer;