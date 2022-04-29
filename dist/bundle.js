(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Renderer = require('./renderer/index');

class App {
    _effects = [{
        name: '',
        text: '',
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
        })
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
},{}]},{},[1]);
