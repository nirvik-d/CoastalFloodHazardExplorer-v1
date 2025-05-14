declare global {
  namespace JSX {
    interface IntrinsicElements {
      "layer-toggle": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        label?: string;
        "layer-id"?: string;
        "aria-checked"?: string;
      };
    }
  }
}

class LayerToggle extends HTMLElement {
  static get observedAttributes() {
    return ["label", "layer-id"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot
      ?.querySelector("button")
      ?.addEventListener("click", this.toggleLayer);
  }

  disconnectedCallback() {
    this.shadowRoot
      ?.querySelector("button")
      ?.removeEventListener("click", this.toggleLayer);
  }

  toggleLayer = () => {
    const isOn = this.getAttribute("aria-checked") === "true";
    this.setAttribute("aria-checked", (!isOn).toString());

    this.dispatchEvent(
      new CustomEvent("layer-toggle", {
        bubbles: true,
        composed: true,
        detail: {
          layerId: this.getAttribute("layer-id"),
          visible: !isOn,
        },
      })
    );
  };

  render() {
    const label = this.getAttribute("label") || "Toggle Layer";
    const checked = this.getAttribute("aria-checked") === "true";

    this.shadowRoot!.innerHTML = `
        <style>
          button {
            font: inherit;
            padding: 0.5rem 1rem;
            border: 1px solid #ccc;
            background: ${checked ? "#007ac2" : "#f0f0f0"};
            color: ${checked ? "#fff" : "#000"};
            cursor: pointer;
            border-radius: 4px;
          }
        </style>
        <button role="switch" aria-checked="${checked}" aria-label="${label}">
          ${label}
        </button>
      `;
  }

  attributeChangedCallback(name: string) {
    if (name === "label" || name === "aria-checked") {
      this.render();
    }
  }
}

customElements.define("layer-toggle", LayerToggle);
