// js/formManager.js

import { fields, iframeInstance } from "../utils";

export default class FormManager {
  constructor() {
    this.iframe = iframeInstance;
  }

  generateForm() {
    const formContainer = document.getElementById("form");
    if (!formContainer) return;

    this.generateFields(formContainer);
    this.generateButtons(formContainer);
  }

  setValues(interaction) {
    fields.forEach((field) => {
      const element = document.getElementById(field.value);
      if (element) {
        element.value = interaction[field.value] || '';
      }
    });
  }

  generateFields(container) {
    fields.forEach((field) => {
      const fieldHTML = `
        <div class="row">
          <label id="label${field.value}" for="${field.value}">${field.text}</label>
          <input type="text" name="${field.value}" id="${field.value}">
        </div>
      `;
      container.innerHTML += fieldHTML;
    });
  }

  generateButtons(container) {
    const buttonsHTML = `
      <div class="buttonContainer">
        <button id="cancel" class="cancel">Cancel</button>
        <button id="confirm" class="confirm">Confirm</button>
      </div>
    `;
    container.innerHTML += buttonsHTML;

    document.getElementById("confirm").onclick = () => {
      if (this.validate()) {
        this.iframe.sent();
      }
    };

    document.getElementById("cancel").onclick = () => {
      this.iframe.close();
    };
  }

  validate() {
    return fields.every(field => {
      const input = document.getElementById(field.value);
      const label = document.getElementById(`label${field.value}`);

      const isValid = !!input?.value;

      if (label) label.classList.toggle("error", !isValid);
      if (input) input.classList.toggle("error", !isValid);

      return isValid;
    });
  }
}
