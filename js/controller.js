class Controller extends EventEmitter {
    static id = 'controller';
    static counterId = 'controllerCounter'

    target;
    prev;
    next;

    //"dots" or "count"
    counterType;
    //actual by "count" type controller
    _count;

    constructor(controllerElement) {
        super()
        this.init(controllerElement)
    }

    init(element) {
        this.target = element;
        this.next = this.target.querySelector('button.next')
        this.prev = this.target.querySelector('button.prev')

        this.next.addEventListener('click', () => this.onNext())
        this.prev.addEventListener('click', () => this.onPrev())

        this.implementCounter()
    }

    onNext() {
        this.emit('next')
    }

    onPrev() {
        this.emit('prev')
    }

    setCounter(count) {
        if (this.counterType === 'dots') this._shiftCounter(this._count, count)
        this._count = count
    }

    _shiftCounter(prev, count) {
        const dots = this.target.querySelector(`#${Controller.counterId}`)
        const dotsChildren = Array.from(dots.children)

        dotsChildren.forEach((dot, index) => {
            dot.classList[index + 1 === count ? 'add' : 'remove']('active');
        })
    }

    implementCounter() {
        this.counterType = this.target.dataset.type
        if (!this.counterType) return;
    }
}