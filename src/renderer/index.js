class Renderer {
    _width = 300;
    _height = 300;
    _renderer = null;
    _supportedEffects = {
        spin: {
            name: 'spin',
            text: '旋转',
            settings: {
                frequency: {
                    name: 'frequency',
                    text: '频率',
                    value: 1,
                },
                stops: {
                    name: 'stops',
                    text: '头像停顿（100毫秒）',
                    value: 10,
                },
                counts: {
                    name: 'counts',
                    text: '间隔（个）',
                    value: 3,
                }, 
                times: {
                    name: 'times',
                    text: '次数',
                    value: 6,
                }, 
            }
        }, 
        shutter: {
            name: 'shutter',
            text: '百叶窗',
            settings: {
                frequency: {
                    name: 'frequency',
                    text: '频率（50毫秒）',
                    value: 1,
                },
                stops: {
                    name: 'stops',
                    text: '头像停顿（100毫秒）',
                    value: 10,
                },
                counts: {
                    name: 'counts',
                    text: '间隔（个）',
                    value: 3,
                }, 
                times: {
                    name: 'times',
                    text: '次数（次）',
                    value: 6,
                }, 
            }
        }
    };
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

    _renderSpin(dataSet) {
        const msg = document.getElementById("msg");
        msg.innerText = "开始渲染";
        this._renderDefaultWhoAmI();
        this._renderAvatarWithSpin(
            dataSet.avatar,
            Number(this._supportedEffects.spin.settings.frequency.value) * 50,
            Number(this._supportedEffects.spin.settings.counts.value),
            Number(this._supportedEffects.spin.settings.times.value)
        );
        this._renderAvatar(dataSet.avatar, Number(this._supportedEffects.shutter.settings.frequency.stops) * 100);
        this._renderImage(dataSet.images);
        this._renderer.render();
        msg.innerText = "渲染成功";
    }

    _renderShutter(dataSet) {
        const msg = document.getElementById("msg");
        msg.innerText = "开始渲染";
        this._renderDefaultWhoAmI();
        this._renderAvatarWithShutter(
            dataSet.avatar,
            Number(this._supportedEffects.shutter.settings.frequency.value) * 50,
            Number(this._supportedEffects.shutter.settings.counts.value),
            Number(this._supportedEffects.shutter.settings.times.value)
        );
        this._renderAvatar(dataSet.avatar, Number(this._supportedEffects.shutter.settings.frequency.stops) * 100);
        this._renderImage(dataSet.images);
        this._renderer.render();
        msg.innerText = "渲染成功";
    }

    _renderDefault(dataSet) {
        const msg = document.getElementById("msg");
        msg.innerText = "开始渲染";
        this._renderDefaultWhoAmI();
        this._renderAvatar(dataSet.avatar, 1000);
        this._renderImage(dataSet.images);
        this._renderer.render();
        msg.innerText = "渲染成功";
    }

    getSupportedEffects() {
        return Object.values(this._supportedEffects);
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

    _renderAvatar(avatar, interval) {
        this._renderCanvas(avatar, interval);
    }

    _renderAvatarWithSpin(avatar, interval, spinCount, times) {
        for (let i = 0; i < times; i ++) {
            this._renderSpins(avatar, interval, spinCount);
        }
    }

    _renderAvatarWithShutter(avatar, interval, shutterCount, times) {
        for (let i = 0; i < times; i ++) {
            this._renderShutters(avatar, interval, shutterCount);
        }
    }

    _renderSpins(avatar, interval, spinCount) {
        for (let i = 0; i < spinCount; i ++) {
            let beginDeg = (360 / spinCount) * i;
            let endDeg = 360 / spinCount + beginDeg;
            this._renderSpinCanvas(avatar, beginDeg, endDeg, interval);
        }
    }

    _renderShutters(avatar, interval, shutterCount) {
        for (let i = 0; i < shutterCount; i ++) {
            const width = this._width / shutterCount;
            const start = width * i;
            this._renderShutterCanvas(avatar, start, width, interval);
        }
    }

    _renderSpinCanvas(image, beginDeg, endDeg, interval) {
        const preview = document.getElementById("can");
        const canvas = document.createElement("canvas");
        canvas.width = this._width;
        canvas.height = this._height;
        this._drawImage(image, canvas);

        canvas.getContext("2d").beginPath();
        canvas.getContext("2d").arc(this._width / 2, this._height / 2, this._width * 1.414, (Math.PI * beginDeg) / 180, (Math.PI * endDeg) / 180, false);
        canvas.getContext("2d").lineTo(this._width / 2, this._height / 2);
        canvas.getContext("2d").closePath();
        canvas.getContext("2d").fillStyle = "black";
        canvas.getContext("2d").fill();
        
        preview.getContext("2d").arc(this._width / 2, this._height / 2, this._width * 1.414, (Math.PI * beginDeg) / 180, (Math.PI * endDeg) / 180, false);
        preview.getContext("2d").lineTo(this._width / 2, this._height / 2);
        preview.getContext("2d").closePath();
        preview.getContext("2d").fillStyle = "black";
        preview.getContext("2d").fill();
        this._canvases.push(canvas);
        this._renderer.addFrame(canvas, { delay: interval });
    }

    _renderShutterCanvas(image, start, width, interval) {
        const preview = document.getElementById("can");
        const canvas = document.createElement("canvas");
        canvas.width = this._width;
        canvas.height = this._height;
        this._drawImage(image, canvas);
        canvas.getContext("2d").fillStyle = "black";
        canvas.getContext("2d").fillRect(start, 0, width, this._height);
        preview.getContext("2d").fillStyle = "black";
        preview.getContext("2d").fillRect(start, 0, width, this._height);
        this._canvases.push(canvas);
        this._renderer.addFrame(canvas, { delay: interval });
    }

    _renderDefaultWhoAmI(interval) {
        const whoCanvas = this._renderText("我", 100);
        this._canvases.push(whoCanvas);
        this._renderer.addFrame(whoCanvas, { delay: interval });
        
        const AmCanvas = this._renderText("是", 100);
        this._canvases.push(AmCanvas);
        this._renderer.addFrame(AmCanvas, { delay: interval });
        
        const ICanvas = this._renderText("谁？", 100);
        this._canvases.push(ICanvas);
        this._renderer.addFrame(ICanvas, { delay: interval });

        const whoAmICanvas = this._renderText("我是谁？", 600);
        this._canvases.push(whoAmICanvas);
        this._renderer.addFrame(whoAmICanvas, { delay: interval });
    }

    _renderText(text, interval) {
        var canvas = document.createElement("canvas");
        canvas.width = this._width;
        canvas.height = this._height;
        this._drawText(canvas, text);
        this._renderer.addFrame(canvas, { delay: interval });
        return canvas;
    }

    _renderImage(images) {
        images.forEach((imageData) => {
            this._renderCanvas(imageData.image, imageData.interval);
        })
    }

    _renderCanvas(image, interval) {
        var canvas = document.createElement("canvas");
        canvas.width = this._width;
        canvas.height = this._height;
        this._drawImage(image, canvas);
        this._canvases.push(canvas);
        this._renderer.addFrame(canvas, { delay: interval });
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