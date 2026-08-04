const postPreviewTemplate = document.createElement('template');
postPreviewTemplate.id = 'post-preview';
postPreviewTemplate.innerHTML = `
	<style>
		.post-card {
			border: 1px solid #B8B8B8;
			border-radius: 10px;

			filter: drop-shadow(-6px 4px 5px #00000010);
			background-color: white;

			padding: 0.5rem 1rem;
		}
	</style>

	<li class="post-card">
			<h1>
				<slot name="title"></slot>
			</h1>
			<p class="-content">
				<slot name="content"></slot>
			</p>
		</div>
	</li>
`;

class PostPreviewComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'closed' });

    shadowRoot.appendChild(postPreviewTemplate.content.cloneNode(true));
  }
}

customElements.define('post-preview', PostPreviewComponent);
