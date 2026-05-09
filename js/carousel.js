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
    _currentIndexes = [];
    _prevVisibledIndexes = []
    _scrolling = false;

    infinityEnadled = false;
    infinityDelay = 4000;
    duplicateCount = 5;
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


        this.updateCounter()
    }

    onScroll(event) {
        this.scrolling = true
        const indexes = this.getVisibledItems()

        this.currentIndexes = indexes;
        indexes.length === 1 && this.updateCounter()
    }

    onScrollEnd(event) {
        this.scrolling = false;
        const children = Array.from(this.target.children);
        const visibledItems = this.currentIndexes.map(i => children[i])

        const targetItem = visibledItems[0]
        const isDuplicate = targetItem.dataset.duplicate === 'true'
        var originalIndex = this.currentIndexes[0]

        if (isDuplicate) {
            originalIndex = targetItem.dataset.originalIndex
            const duplicateParent = children.filter(el => el.dataset.duplicate !== 'true')[originalIndex];
            const targetOffsetX = this.target.offsetLeft;
            const offsetX = duplicateParent.offsetLeft - targetOffsetX;

            this.target.scrollTo({ left: offsetX })
        }

        this.updateCounter()
    }

    updateCounter() {
        const vIndexes = this.getVisibledItems();
        const children = Array.from(this.target.children);
        const visibledItems = vIndexes.map(i => children[i])

        const targetItem = visibledItems[0]
        if (!targetItem) return
        const isDuplicate = targetItem.dataset.duplicate === 'true'
        var originalIndex = vIndexes[0]

        if (isDuplicate) {
            originalIndex = +targetItem.dataset.originalIndex
        }

        if (this._controller && vIndexes.length) this._controller.setCounter(vIndexes.length > 1 ? vIndexes.length : (originalIndex + 1 - ((!isDuplicate && this.infinityEnadled) ? this.duplicateCount : 0)))

        const isStart = vIndexes[0] === 0;
        const isEnd = vIndexes[vIndexes.length - 1] === (children.length - 1)

        this._controller.disablePrev(isStart);
        this._controller.disableNext(isEnd);
    }

    updateItemRects(element) {
        const items = Array.from(element.querySelectorAll(`.${Carousel.itemClass}`));
        const rects = items.map(element => element.getBoundingClientRect())
        this.rectMap = rects
    }

    initInfinityScroll(element) {
        const isInfinity = element.dataset.infinity === 'true';
        this.infinityEnadled = isInfinity;
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
        if (!this.infinityEnadled) return
        this._infinityInterval = setInterval(() => {
            if (this.scrolling) return;
            const children = Array.from(this.target.children);
            const lastVisibled = this.currentIndexes[this.currentIndexes.length - 1]
            const nextElement = children[lastVisibled + 1]
            const offsetX = nextElement.offsetLeft;
            this.target.scrollTo({ left: offsetX, behavior: "smooth", })
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

    getVisibledItems() {
        const shiftToCenter = this.rectMap[0].left;
        const offsetX = this.target.scrollLeft + shiftToCenter;
        const offsetRight = offsetX + this.target.clientWidth;

        const prevIndexesEmpty = this._prevVisibledIndexes.length === 0
        const indexes = []

        for (let i = 0; i < this.rectMap.length; i++) {
            const rect = this.rectMap[i]
            if (rect.left >= offsetX && rect.right <= offsetRight) {
                const target = Array.from(this.target.children)[i]
                const isDup = target.dataset.duplicate
                if (!(prevIndexesEmpty && isDup)) indexes.push(i)
            }
        }
        this.currentIndexes = indexes
        return indexes
    }

    scrollToRelativeByCount(count) {
        const children = Array.from(this.target.children)
        const isNegative = count < 0;
        const targetIndex = this.currentIndexes[isNegative ? 0 : this.currentIndexes.length - 1]
        if (targetIndex === undefined) {
            return;
        }
        const scrollTarget = children[targetIndex + count]
        const isDuplicate = scrollTarget.dataset.duplicate === 'true'
        if (!scrollTarget) return;
        const offsetX = scrollTarget.offsetLeft;

        this.target.scrollTo({ left: offsetX, behavior: 'smooth' })
    }

    set currentIndexes(value) {
        this._currentIndexes = value
        if (value.length) {
            this._prevVisibledIndexes = value
        }
    }

    get currentIndexes() { return this._currentIndexes }

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
        const maxW = item.dataset.maxW
        if (maxW && window.outerWidth >= maxW) continue


        const next = (item.dataset.id && Array.from(document.querySelectorAll(`#${Controller.id}`)).find(el => el.dataset.id === item.dataset.id && el.clientWidth > 0)) || item.nextElementSibling
        console.log("🚀 ~ initCarouselModule ~ next:", next)
        const nextIsControllerElement = next.id === Controller.id
        const carousel = new Carousel(item, nextIsControllerElement ? new Controller(next) : undefined)
        carousels.push(carousel)
    }

}

register(initCarouselModule)