import NotificationMessage from '../../../components/notification';
import ProductForm from '../../../components/product-form';
import Router from '../../../router';

export default class Page {
  element;
  subElements = {};
  components = {};
  notificationDuration = 2000;

  constructor() {
    const url = new URL(window.location.href);
    const [category, id] = url.pathname.split('/');
    this.id = id !== 'add' ? id : '';
    this.title = this.id ? 'Редактировать' : 'Добавить';
  }

  get template() {
    return `
    <div class='products-edit'>
        <div class='content__top-panel'>
          <h1 class='page-title'>
            <a href='/products' class='link'>Товары</a> / ${this.title}
          </h1>
        </div>
        <div class='content-box' data-element='productForm'></div>
      </div>
    `;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.components = await this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  async initComponents() {
    const productForm = new ProductForm(this.id);
    await productForm.render();

    const notificationAdd = new NotificationMessage('Товар сохранен', {
      duration: this.notificationDuration,
      type: 'success'
    });

    const notificationUpdate = new NotificationMessage('Товар обновлен', {
      duration: this.notificationDuration,
      type: 'success'
    });

    return {
      productForm,
      notificationAdd,
      notificationUpdate
    };
  }

  initEventListeners() {
    this.components.productForm.element.addEventListener('product-saved', event => {
      const id = event.detail;
      this.components.notificationAdd.show();
      const router = Router.instance();
      router.navigate(`/products/${id}`);
    });

    this.components.productForm.element.addEventListener('product-updated', () => {
      this.components.notificationUpdate.show();
    });
  }

  renderComponents() {
    for (const componentName of Object.keys(this.components)) {
      const root = this.subElements[componentName];
      const element = this.components[componentName].element;

      if (root) {
        root.append(element);
      }
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
