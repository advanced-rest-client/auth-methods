/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {AmfHelperMixin} from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import {AuthMethodsMixin} from './auth-methods-mixin.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/iron-form/iron-form.js';
import '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/marked-element/marked-element.js';
import '@api-components/api-view-model-transformer/api-view-model-transformer.js';
import '@api-components/api-property-form-item/api-property-form-item.js';
import './auth-methods-styles.js';
import './auth-method-step.js';
/**
 * The `<auth-method-custom>` element displays a form to provide the
 * authorization details for RAML's custom security scheme.
 *
 * The element, alike other auth methods, dispatches `auth-settings-changed`
 * custom event. However, it also sends `request-header-changed` and
 * `query-parameters-changed` custom event to directly manipulate values
 * in corresponding UI element. This events are supported with all API components
 * that handles headers or query parameters.
 *
 * This element is rendered empty if `amfSettings` property is not set.
 * Parent element or application should check if model contains the scheme.
 *
 * ### Example
 *
 * ```html
 * <auth-method-custom security-scheme="{...}"></auth-method-custom>
 * ```
 *
 * ### Styling
 * `<auth-methods>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--auth-method-custom` | Mixin applied to the element. | `{}`
 * `--auth-method-panel` | Mixin applied to all auth elements. | `{}`
 * `--inline-help-icon-color` | Color of the icon button to display help | `rgba(0, 0, 0, 0.74)`
 * `--inline-help-icon-color-hover` | Color of the icon button to display help when hovered | `--accent-color` or `rgba(0, 0, 0, 0.88)`
 * `--raml-headers-form-input-label-color` | Color of the lable of the `paper-input` element. | `rgba(0, 0, 0, 0.48)`
 * `raml-headers-form-input-label-color-required` | Color of the lable of the `paper-input` element when it's required. | `rgba(0, 0, 0, 0.72)`
 *
 * ## Changes in version 2
 *
 * - The element now works with AMF json/ld data model. RAML json parser output
 * is no longer supported.
 * - `ramlSettings` has been renamed to `amfSettings`
 * - Added scheme title and documentation to the panel.
 *
 * @customElement
 * @polymer
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 * @appliesMixin AuthMethodsMixin
 * @appliesMixin ApiElements.AmfHelperMixin
 * @demo demo/custom.html
 */
class AuthMethodCustom extends AmfHelperMixin(AuthMethodsMixin(EventsTargetMixin(PolymerElement))) {
  static get template() {
    return html`<style include="markdown-styles"></style>
    <style include="auth-methods-styles">
    :host {
      display: block;
      @apply --auth-method-panel;
      @apply --auth-method-custom;
    }

    .field-value {
      @apply --layout-horizontal;
      @apply --layout-flex;
    }

    api-property-form-item {
      @apply --layout-flex;
    }

    .header-item,
    .param-item {
      width: 100%;
    }

    .help-icon {
      margin-top: var(--auth-method-custom-help-icon-margin-top, 16px);
    }

    h3 {
      @apply --arc-font-subhead;
      @apply --auth-method-custom-subheader;
    }

    .scheme-header h3 {
      @apply --layout-horizontal;
      @apply --layout-center;
      margin: 0;
    }
    </style>
    <auth-method-step step-start-index="[[stepStartIndex]]" step="1" no-steps="[[noSteps]]">
      <span slot="title">Set authorization data</span>
      <section>
        <template is="dom-if" if="[[schemeName]]">
          <div class="scheme-header">
            <h3>
              <span>Scheme: [[schemeName]]</span>
              <template is="dom-if" if="[[_computeHasDoc(noDocs, schemeDescription)]]">
                <paper-icon-button class="hint-icon" icon="arc:help" on-click="toggleSchemeDocumentation" title="Display scheme description"></paper-icon-button>
              </template>
            </h3>
            <template is="dom-if" if="[[_computeHasDoc(noDocs, schemeDescription)]]">
              <div class="docs-container">
                <iron-collapse opened="[[documentationOpened]]">
                  <marked-element markdown="[[schemeDescription]]" main-docs="">
                    <div slot="markdown-html" class="markdown-body"></div>
                  </marked-element>
                </iron-collapse>
              </div>
            </template>
          </div>
        </template>
        <iron-form>
          <form autocomplete="on">
            <template is="dom-if" if="[[hasHeaders]]">
              <section class="headers-section">
                <template is="dom-repeat" items="{{headers}}" data-repeater="header">
                  <div class="header-item">
                    <div class="field-value">
                      <api-property-form-item model="[[item]]" name="[[item.name]]" value="{{item.value}}" on-value-changed="_headerValueChanged" data-type="header"></api-property-form-item>
                      <template is="dom-if" if="[[_computeHasDoc(noDocs, item.hasDescription)]]">
                        <paper-icon-button class="help-icon hint-icon" icon="arc:help" on-click="_toggleDocumentation" data-source="header" title="Display documentation" noink="[[noink]]"></paper-icon-button>
                      </template>
                    </div>
                    <div class="data-docs docs-container" data-source="header" data-key\$="[[item.name]]"></div>
                  </div>
                </template>
              </section>
            </template>
            <template is="dom-if" if="[[hasQueryParameters]]">
              <section class="query-section">
                <template is="dom-repeat" items="{{queryParameters}}" data-repeater="query">
                  <div class="param-item">
                    <div class="field-value">
                      <api-property-form-item model="[[item]]" name="[[item.name]]" value="{{item.value}}" on-value-changed="_queryValueChanged" data-type="query"></api-property-form-item>
                      <template is="dom-if" if="[[_computeHasDoc(noDocs, item.hasDescription)]]">
                        <paper-icon-button class="help-icon hint-icon" icon="arc:help" on-click="_toggleDocumentation" data-source="query" title="Display documentation" noink="[[noink]]"></paper-icon-button>
                      </template>
                    </div>
                    <div class="data-docs docs-container" data-source="query" data-key\$="[[item.name]]"></div>
                  </div>
                </template>
              </section>
            </template>
          </form>
        </iron-form>
      </section>
    </auth-method-step>`;
  }
  static get is() {
    return 'auth-method-custom';
  }
  static get properties() {
    return {
      /**
       * AMF security scheme model.
       */
      amfSettings: {
        type: Object
      },
      /**
       * Computed list of headers to render in the form.
       */
      headers: {
        type: Array,
        readOnly: true
      },
      /**
       * Computed list of query parameters to render.
       */
      queryParameters: {
        type: Array,
        readOnly: true
      },
      // Computed value, true if headers are defined in RAML settings.
      hasHeaders: {
        type: Boolean,
        computed: '_computeHasData(headers)'
      },
      // Computed value, true if query parameters are defined in RAML settings.
      hasQueryParameters: {
        type: Boolean,
        computed: '_computeHasData(queryParameters)'
      },
      /**
       * Name of the security scheme
       */
      schemeName: {
        type: String,
        readOnly: true
      },
      /**
       * Security scheme description
       */
      schemeDescription: {
        type: String,
        readOnly: true
      },
      /**
       * True to opend scheme descripyion, if available.
       */
      documentationOpened: Boolean
    };
  }

  static get observers() {
    return [
      '_settingsChanged(headers.*)',
      '_settingsChanged(queryParameters.*)',
      '_schemeChanged(amfSettings, amfModel)'
    ];
  }

  constructor() {
    super();
    this._headerChangedHandler = this._headerChangedHandler.bind(this);
    this._parameterChangedHandler = this._parameterChangedHandler.bind(this);
  }

  _attachListeners(node) {
    node.addEventListener('request-header-changed', this._headerChangedHandler);
    node.addEventListener('query-parameter-changed', this._parameterChangedHandler);
  }

  _detachListeners(node) {
    node.removeEventListener('request-header-changed', this._headerChangedHandler);
    node.removeEventListener('query-parameter-changed', this._parameterChangedHandler);
  }

  ready() {
    super.ready();
    afterNextRender(this, () => {
      this._initialized = true;
    });
  }
  /**
   * Validates the form.
   *
   * @return {Boolean} `true` if valid, `false` otherwise.
   */
  validate() {
    const form = this.shadowRoot.querySelector('iron-form');
    return form.validate();
  }

  _schemeChanged() {
    if (this.__schemeChangeDebouncer) {
      return;
    }
    this.__schemeChangeDebouncer = true;
    afterNextRender(this, () => {
      this.__schemeChangeDebouncer = false;
      this.__schemeChanged(this.amfSettings);
    });
  }

  __schemeChanged(model) {
    const prefix = this.ns.raml.vocabularies.security;
    this.headers = undefined;
    this.queryParameters = undefined;
    this._clearDocs();
    if (!this._hasType(model, this.ns.raml.vocabularies.security + 'ParametrizedSecurityScheme')) {
      return;
    }
    const shKey = this._getAmfKey(prefix + 'scheme');
    let scheme = model[shKey];
    let type;
    if (scheme) {
      if (scheme instanceof Array) {
        scheme = scheme[0];
      }
      type = this._getValue(scheme, prefix + 'type');
    }

    if (!type || type.indexOf('x-') !== 0) {
      return;
    }
    const hKey = this._getAmfKey(this.ns.raml.vocabularies.http + 'header');
    const pKey = this._getAmfKey(this.ns.raml.vocabularies.http + 'parameter');
    this._createViewModel('header', this._ensureArray(scheme[hKey]));
    this._createViewModel('parameter', this._ensureArray(scheme[pKey]));
    this._setSchemeName(this._getValue(model, prefix + 'name'));
    this._setSchemeDescription(this._getValue(scheme, this.ns.schema.desc));
  }
  /**
   * Generates view model using the tranformer.
   *
   * @param {String} type Param type. Either `header` or `parameter`.
   * @param {Array} model
   * @return {Promise}
   */
  _createViewModel(type, model) {
    if (!model) {
      return;
    }
    const factory = document.createElement('api-view-model-transformer');
    factory.amfModel = this.amfModel;
    const data = factory.computeViewModel(model);
    if (!data) {
      return;
    }
    if (type === 'header') {
      this._setHeaders(data);
    } else if (type === 'parameter') {
      this._setQueryParameters(data);
    }
  }

  _computeHasData(data) {
    return !!(data && data.length);
  }

  _settingsChanged(record) {
    if (!this.shadowRoot || this.__cancelChangeEvent || !this._initialized) {
      return;
    }
    if (!record || !record.path) {
      this._debounceNotify();
      return;
    }
    const path = record.path;
    switch (path) {
      case 'headers':
      case 'headers.splices':
      case 'headers.length':
      case 'queryParameters':
      case 'queryParameters.splices':
      case 'queryParameters.length':
        return this._debounceNotify();
      default:
        if (/[headers|queryParameters]\.\d+\.[name|value]/.test(path)) {
          this._debounceNotify();
          return;
        }
    }
  }
  /**
   * Returns current configuration of the OAuth2.
   *
   * @return {Object} Current OAuth2 configuration.
   */
  getSettings() {
    if (!this.shadowRoot) {
      return {};
    }
    const form = this.shadowRoot.querySelector('iron-form');
    return form.serializeForm();
  }
  /**
   * Restores settings from stored value.
   * For custom methods this is dummy function.
   */
  restore() {}

  _debounceNotify() {
    if (this.__notifyingChange) {
      return;
    }
    this.__notifyingChange = true;
    setTimeout(() => {
      this._notifySettingsChanged();
      this.__notifyingChange = false;
    }, 25);
  }
  /**
   * Notifies about settings change.
   */
  _notifySettingsChanged() {
    const detail = {
      settings: this.getSettings(),
      type: 'x-custom',
      name: this.schemeName,
      valid: this.validate()
    };
    this.dispatchEvent(new CustomEvent('auth-settings-changed', {
      detail: detail,
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Dispatches headers change event on user input.
   */
  _headerValueChanged(e) {
    this._propertyValueChanged('header', e);
  }
  /**
   * Dispatches query parameter change event on user input.
   */
  _queryValueChanged(e) {
    this._propertyValueChanged('parameter', e);
  }
  /**
   * Dispatches change event for headers and query parameters.
   *
   * @param {String} type Change type. `header` or `parameter`.
   * @param {CustomEvent} e Custom event dispatched by the form control.
   */
  _propertyValueChanged(type, e) {
    const model = e.model.get('item');
    const eventType = type === 'header' ? 'request-header-changed' : 'query-parameter-changed';
    this.dispatchEvent(new CustomEvent(eventType, {
      detail: {
        name: model.name,
        value: e.detail.value
      },
      bubbles: true,
      composed: true
    }));
  }
  /**
   * Handler for the `request-header-changed` event.
   * It updates value for a single header if this header is already on the list.
   */
  _headerChangedHandler(e) {
    this._updateEventValue('headers', e);
  }
  /**
   * Handler for the `query-parameter-changed` event.
   * It updates value for a single parameter if this parameter is already on the list.
   */
  _parameterChangedHandler(e) {
    this._updateEventValue('queryParameters', e);
  }
  /**
   * Update array value for given type (`headers` or `queryParameters`) for given event.
   */
  _updateEventValue(target, e) {
    if (e.target === this || e.defaultPrevented) {
      return;
    }
    let name = e.detail.name;
    if (!name) {
      return;
    }
    // Headers are case insensitive.
    name = target === 'headers' ? name.toLowerCase() : name;
    const parameters = this[target];
    if (!parameters || !parameters.length) {
      return;
    }
    for (let i = 0, len = parameters.length; i < len; i++) {
      let pName = parameters[i].name;
      if (!pName) {
        continue;
      }
      pName = target === 'headers' ? pName.toLowerCase() : pName;
      if (pName === name) {
        this.set([target, i, 'value'], e.detail.value);
        return;
      }
    }
  }
  /**
   * Toggles documentartion for custom property.
   *
   * @param {CustomEvent} e
   */
  _toggleDocumentation(e) {
    const target = e.target;
    const source = target.dataset.source;
    if (!source) {
      throw new Error('Could not find source of the event.');
    }
    const repeater = this.shadowRoot.querySelector('[data-repeater="' + source + '"]');
    if (!repeater) {
      throw new Error('Could not find repeater for the item.');
    }
    const model = repeater.modelForElement(target).get('item');
    let selector = '.data-docs[data-source="' + source + '"]';
    selector += '[data-key="' + model.name + '"]';
    const docsContainer = this.shadowRoot.querySelector(selector);
    if (!docsContainer) {
      throw new Error('Could not find documentation container.');
    }
    if (!docsContainer.children[0]) {
      this._createDocsElements(model, docsContainer);
    } else {
      docsContainer.children[0].opened = !docsContainer.children[0].opened;
    }
  }
  /**
   * Creates a documentation element.
   *
   * @param {Object} model
   * @param {Object} appendTo
   */
  _createDocsElements(model, appendTo) {
    const collapse = document.createElement('iron-collapse');
    const marked = document.createElement('marked-element');
    const wrapper = document.createElement('div');

    collapse.dataset.docsCollapse = true;
    wrapper.className = 'markdown-html markdown-body';
    marked.appendChild(wrapper);
    collapse.appendChild(marked);
    appendTo.appendChild(collapse);

    marked.markdown = model.description;
    collapse.opened = true;
  }
  /**
   * Clears all custom data documention nodes.
   */
  _clearDocs() {
    const nodes = this.shadowRoot.querySelectorAll('[data-docs-collapse="true"]');
    if (!nodes || !nodes.length) {
      return;
    }
    nodes.forEach((node) => node.parentNode.removeChild(node));
  }
  /**
   * Toggles docs opened state
   */
  toggleSchemeDocumentation() {
    this.documentationOpened = !this.documentationOpened;
  }
  /**
   * Fired when the any of the auth method settings has changed.
   * This event will be fired quite frequently - each time anything in the text field changed.
   * With one exception. This event will not be fired if the validation of the form didn't passed.
   *
   * @event auth-settings-changed
   * @param {Object} settings Current settings containing hash, password
   * and username.
   * @param {String} type The authorization type - x-custom
   * @param {Boolean} valid True if the form has been validated.
   * @param {String} name Name of the custom method to differeciante them if many.
   */
  /**
   * Fired when the header value has changed.
   *
   * @event request-header-changed
   * @param {String} name Name of the header
   * @param {String} value Value of the header
   */
  /**
   * Fired when the header value has changed.
   *
   * @event query-parameter-changed
   * @param {String} name Name of the parameter
   * @param {String} value Value of the parameter
   */
}
window.customElements.define(AuthMethodCustom.is, AuthMethodCustom);