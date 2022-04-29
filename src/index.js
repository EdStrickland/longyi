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