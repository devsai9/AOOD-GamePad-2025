const Keys = {};

document.body.addEventListener("keydown", e => {
    Keys[e.code] = true;
});

document.body.addEventListener("keyup", e => {
    Keys[e.code] = false;
});

export const Keyboard = {
    pressed(key) {
        return Keys[key] || false;
    }
};