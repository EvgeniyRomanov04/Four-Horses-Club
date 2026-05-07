/**
 * Модуль слайдера
 * Поддерживает бексконечную прокрутку
 * Управление через data атрибут
 * @param infinity - включает бесконечную прокрутку и зацикленность string: true||false
 */
class Carousel {
    static id = 'carousel'
    static itemClass = 'carousel__item'

    target;
    rectMap = []
    _currentIndex = 0;
    _scrolling = false;

    infinityDelay = 4000;
    duplicateCount = 4;
    _infinityInterval;

    _controller;

    constructor(element, controller) {
        this.init(element, controller)
        this.initInfinityScroll(element)
    }

    init(element, controller) {
        this.target = element
        this.target.addEventListener('scroll', (e) => this.onScroll(e))
        this.target.addEventListener('scrollend', (e) => this.onScrollEnd(e))
        this.updateItemRects(element)

        if (!controller) return
        this._controller = controller
        this._controller.on('next', () => this.scrollToRelativeByCount(1))
        this._controller.on('prev', () => this.scrollToRelativeByCount(-1))
    }

    onScroll(event) {
        this.scrolling = true
        const shiftToCenter = this.rectMap[0].left;
        const offsetY = this.target.scrollLeft + shiftToCenter;
        const offsetRight = offsetY + this.target.clientWidth;
        const newIndex = this.rectMap.findIndex(rect => rect.left <= offsetY && rect.right === offsetRight)
        if (newIndex === -1) return
        this.currentIndex = newIndex;
    }

    onScrollEnd(event) {
        this.scrolling = false;
        const children = Array.from(this.target.children);
        const centerItem = children[this._currentIndex]

        const isDuplicate = centerItem.dataset.duplicate === 'true'
        var originalIndex = this._currentIndex

        if (isDuplicate) {
            originalIndex = centerItem.dataset.originalIndex
            const duplicateParent = children.filter(el => el.dataset.duplicate !== 'true')[originalIndex];
            const offsetY = duplicateParent.offsetLeft;

            this.target.scrollTo({ left: offsetY })
        }

        this._controller.setCounter(originalIndex + 1 - this.duplicateCount)
    }

    updateItemRects(element) {
        const items = Array.from(element.querySelectorAll(`.${Carousel.itemClass}`));
        const rects = items.map(element => element.getBoundingClientRect())
        this.rectMap = rects
    }

    initInfinityScroll(element) {
        const isInfinity = element.dataset.infinity === 'true';
        if (!isInfinity) return;
        const children = Array.from(this.target.children);
        const start = this.createDuplicate(children.slice(0, this.duplicateCount), this.target);
        const end = this.createDuplicate(children.slice(children.length - this.duplicateCount, children.length), this.target)
        this.target.append(...start);
        this.target.prepend(...end);
        this.updateItemRects(this.target)

        this.startInitInfinityScroll()
    }

    startInitInfinityScroll() {
        this._infinityInterval = setInterval(() => {
            if (this.scrolling) return;
            const children = Array.from(this.target.children);
            const nextElement = children[this._currentIndex + 1]
            const offsetY = nextElement.offsetLeft;
            this.target.scrollTo({ left: offsetY, behavior: "smooth", })
        }, this.infinityDelay)
    }

    stopInitInfinityScroll() {
        clearInterval(this._infinityInterval)
    }

    createDuplicate(elements, parent) {
        return elements.map(element => {
            const child = Array.from(parent.children)
            const targetIndex = child.findIndex(el => el === element);

            const dup = element.cloneNode(true)
            dup.dataset.duplicate = true;
            dup.dataset.originalIndex = targetIndex
            return dup
        })
    }

    scrollToRelativeByCount(count) {
        const children = Array.from(this.target.children)
        const scrollTarget = children[this._currentIndex + count]
        const isDuplicate = scrollTarget.dataset.duplicate === 'true'
        if (!scrollTarget) return;
        const offsetY = scrollTarget.offsetLeft;

        this.target.scrollTo({ left: offsetY, behavior: 'smooth' })
    }

    set currentIndex(value) {
        const prevState = this._currentIndex
        if (prevState !== value) {
            this._currentIndex = value
        }
    }

    get currentIndex() { return this._currentIndex }

    set scrolling(value) {
        this._scrolling = value;
        if (value)
            this.stopInitInfinityScroll()
        else
            this.startInitInfinityScroll()

    }

    get scrolling() { return this._scrolling }
}

const carousels = []

const initCarouselModule = () => {
    const carouselElements = Array.from(document.querySelectorAll(`#${Carousel.id}`));
    for (const item of carouselElements) {
        //логическая привязка контроллера по разметке, сначала идет карусель, следующим контроллер
        //в будущем можно сделать конкретную привязку
        const next = item.nextElementSibling
        const nextIsControllerElement = next.id === Controller.id
        const carousel = new Carousel(item, nextIsControllerElement ? new Controller(next) : undefined)
        carousels.push(carousel)

    }
}

register(initCarouselModule)