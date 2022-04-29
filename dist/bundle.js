(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Renderer = require('./renderer/index');

class App {
    _effects = [{
        name: '',
        text: '',
        settings: []
    }];
    _selectedEffect = null;
    _avatar = null;
    _images = [];
    _renderer = null;

    init() {
        this._renderer = new Renderer();
        this._prepareEffects();
        window.uploadAvatar = app.uploadAvatar.bind(this);
        window.uploadImage = app.uploadImage.bind(this);
        window.selectEffect = app.selectEffect.bind(this);
        window.render = app.render.bind(this);
        window.clearData = app.clearData.bind(this);
    }

    uploadAvatar() {
        const avatarFile = document.querySelector('#avatar').files[0];
        const avatar = new Image();
        avatar.src = URL.createObjectURL(avatarFile);
        this. _avatar = avatar;
    }

    uploadImage() {
        const imageFile = document.querySelector('#image').files[0];
        if (!this._uploadPreCheck(imageFile)) {
            return;
        };
        const image = new Image();
        const latency = 1000;
        image.src = URL.createObjectURL(imageFile);
        this._images.push({
            image: image,
            latency: latency
        });
        this._prepareSettings();
    }

    selectEffect() {
        this._selectedEffect = document.querySelector('#effects').value;
        document.querySelector('#effectSettings').innerHTML = '';
        this._effects.filter((effect) => effect.name === this._selectedEffect).forEach((effect) => {
            Object.values(effect.settings).forEach((setting) => {
                const div = document.createElement('div');
                const range = document.createElement('input');
                range.id = `setting-${setting.name}`;
                range.name = setting.name;
                range.type = 'range';
                range.min = 0;
                range.max = 40;
                range.step = 1;
                range.oninput = this.updateSettings.bind(this);
                const labelText = document.createElement('span');
                labelText.id = `${range.id}-label`;
                labelText.innerText = setting.text;
                const valueText = document.createElement('span');
                valueText.id = `${range.id}-value`;
                valueText.innerText = setting.value;
                const br = document.createElement('br');
                div.appendChild(labelText);
                div.appendChild(range);
                div.appendChild(valueText);
                div.appendChild(br);
                document.querySelector('#effectSettings').appendChild(div);
            });
        });
    }

    updateSettings(event) {
        document.querySelector(`#${event.currentTarget.id}-value`).innerText = event.currentTarget.value;
        this._effects.filter((effect) => effect.name === this._selectedEffect).forEach((effect) => {
            effect.settings[event.currentTarget.name].value = event.currentTarget.value;
        });
    }

    render() {
        if (!this._renderPreCheck()) {
            return;
        };
        this._renderer.render(this._selectedEffect, this._getRenderData());
    }

    clearData() {
        this._selectedEffect = null;
        this._avatar = null;
        this._images = [];
        document.querySelector('#settings').innerHTML = '';
        document.querySelector('#effectSettings').innerHTML = '';
        document.querySelector('#effects').value = '';
        document.querySelector('#avatar').value = null;
        document.querySelector('#image').value = null;
        document.querySelector("#target").src = '';
        document.querySelector("#msg").innerText = "";
    }

    updateRange(event) {
        document.querySelector(`#${event.currentTarget.id}-value`).innerText = event.currentTarget.value;
        this._images[event.currentTarget.name].latency = Number (event.currentTarget.value);
    }

    removeImage(event) {
        this._images.splice(event.currentTarget.name, 1);
        this._prepareSettings();
    }

    _uploadPreCheck (file) {
        if (!file) {
            return false;
        }
        return true;
    }

    _renderPreCheck() {
        if (!this._avatar || this._images.length === 0) {
            return false;
        }
        return true;
    }

    _prepareSettings() {
        document.querySelector('#settings').innerHTML = '';
        this._images.forEach((imageData, index) => {
            this._insertSettings(index, imageData.image.src, imageData.latency);
        });
    }

    _insertSettings(pos, imageSrc, value) {
        const image = new Image();
        image.src = imageSrc;
        image.width = 50;
        const div = document.createElement('div')
        const range = document.createElement('input');
        range.id = `setting-${pos}`;
        range.name = pos;
        range.type = 'range';
        range.min = 1000;
        range.max = 10000;
        range.step = 500;
        range.oninput = this.updateRange.bind(this);
        const valueText = document.createElement('span');
        valueText.id = `${range.id}-value`;
        valueText.innerText = value;
        const remove = document.createElement('button');
        remove.id = `${range.id}-remove`;
        remove.innerText = 'x';
        remove.name = pos;
        remove.onclick = this.removeImage.bind(this);
        const br = document.createElement('br');
        div.appendChild(image);
        div.appendChild(range);
        div.appendChild(valueText);
        div.appendChild(remove);
        div.appendChild(br);
        document.querySelector('#settings').appendChild(div);
    }

    _prepareEffects() {
        this._effects = [...this._effects, ...this._renderer.getSupportedEffects()]
        this._effects.forEach((effect) => {
            const option = document.createElement('option');
            option.id = effect.name;
            option.value = effect.name;
            option.innerText = effect.text;
            document.querySelector('#effects').appendChild(option);
        });
    }

    _getRenderData() {
        return {
            avatar: this._avatar, 
            images: this._images
        };
    }
}

const app = new App();
app.init();
},{"./renderer/index":2}],2:[function(require,module,exports){
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
},{}]},{},[1]);
