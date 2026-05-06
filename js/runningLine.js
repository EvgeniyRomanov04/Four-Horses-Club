/**
 * Модуль бегущих строк
 * Настройка через data атрибут
 * translate-x: значение сдвига Number
 * speed: скорость в px сдвига на кадр Number
 * delay: задержка между итерациями Number
 */

class RunningLine {
    parent;
    target;
    currentText = ''
    renderElement;
    speed = 0.5;
    delay = 0;

    static id = 'runningLine'
    static containerClassName = 'running-line-container'
    static textClassName = 'running-line-text'

    constructor(element) {
        this.initialize(element)
    }

    initialize(element) {
        this.parent = element.parentElement;
        this.target = element;
        this.currentText = element.outerText;
        if (element.dataset.speed) this.speed = element.dataset.speed;
        if (element.dataset.delay) this.delay = element.dataset.delay;

        this.mountModule();
        this.startAnimation();
    }

    mountModule() {
        const container = document.createElement('div');
        container.className = RunningLine.containerClassName;
        container.id = RunningLine.id;
        const text = document.createElement('span');
        text.className = RunningLine.textClassName;
        text.innerText = this.currentText

        container.append(text, text.cloneNode(true));

        this.parent.replaceChild(container, this.target)
        this.renderElement = container;
    }

    startAnimation() {
        const container = this.renderElement;
        const items = Array.from(container.childNodes)
        const itemWidth = items[0].offsetWidth

        let detained = this.delay > 0;

        const animate = async () => {
            const startTime = new Date().getTime();
            let timeDiff = 0;
            if (detained) {
                await asyncWhile(() => timeDiff < this.delay, () => {
                    timeDiff = new Date().getTime() - startTime;
                })
                detained = false
            }
            const x = (container.dataset.translateX || 0) - this.speed;
            const shouldRestart = Math.abs(x) >= itemWidth;
            if (shouldRestart) detained = true;
            container.dataset.translateX = shouldRestart ? 0 : x;

            for (const item of items) {
                item.style.transform = shouldRestart ? '' : `translateX(${x}px)`
            }

            requestAnimationFrame(animate)
        }
        animate()
    }

    invalidate() {
        //Размонтировать и привести к изначальному состоянию элемент по необходимости
        //Реализовать stopAnimation & unmountModule
    }
}

const runningLines = []

const initRunningLineModule = () => {
    const runningLinesElement = Array.from(document.querySelectorAll(`#${RunningLine.id}`))
    runningLines.push(...runningLinesElement.map(element => new RunningLine(element)))
}

register(initRunningLineModule)